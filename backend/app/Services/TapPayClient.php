<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class TapPayClient
{
    public function configuration(): array
    {
        $settings = [];
        $methods = [];
        foreach (['card', 'line_pay', 'atm'] as $method) {
            $settings[$method] = $this->methodConfiguration($method);
            if ($settings[$method]['ready']) $methods[] = $method;
        }
        // Keep the public SDK fields and card 3D flag for existing frontends.
        return array_merge($settings['card'], [
            'ready' => $methods !== [], 'methods' => $methods,
            'missing' => $methods === [] ? $settings['card']['missing'] : [],
            'method_settings' => array_map(static fn ($setting) => array_intersect_key($setting,
                array_flip(['enabled', 'ready', 'missing', 'three_domain_secure', 'min_amount', 'max_amount'])), $settings),
        ]);
    }

    public function merchantId(string $method): string
    {
        $key = match ($method) {
            'card' => 'merchant_id', 'line_pay' => 'line_pay_merchant_id', 'atm' => 'atm_merchant_id',
            default => abort(422, '不支援此付款方式。'),
        };
        return (string) config("tappay.$key");
    }

    private function methodConfiguration(string $method): array
    {
        $missing = [];
        foreach (['app_id', 'app_key', 'partner_key', 'shipping_fee'] as $key) {
            if (config("tappay.$key") === null || config("tappay.$key") === '') {
                $missing[] = $key;
            }
        }
        if ($this->merchantId($method) === '') $missing[] = $method === 'card' ? 'merchant_id' : $method.'_merchant_id';
        if (!filter_var(config('tappay.app_id'), FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]])) {
            $missing[] = 'valid_app_id';
        }
        if (filter_var(config('tappay.shipping_fee'), FILTER_VALIDATE_INT, ['options' => ['min_range' => 0, 'max_range' => 199999]]) === false) {
            $missing[] = 'valid_shipping_fee';
        }
        $threshold = config('tappay.free_shipping_threshold');
        if ($threshold !== null && $threshold !== '' && filter_var($threshold, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]) === false) {
            $missing[] = 'valid_free_shipping_threshold';
        }
        $requiresRedirect = $method === 'line_pay' || ($method === 'card' && config('tappay.three_domain_secure'));
        $urlKeys = $requiresRedirect ? ['return_url', 'notify_url'] : ($method === 'atm' ? ['notify_url'] : []);
        foreach ($urlKeys as $key) {
                $url = config("tappay.$key");
                if (!filter_var($url, FILTER_VALIDATE_URL) || parse_url($url, PHP_URL_SCHEME) !== 'https'
                    || parse_url($url, PHP_URL_QUERY) || parse_url($url, PHP_URL_FRAGMENT)
                    || parse_url($url, PHP_URL_USER) || parse_url($url, PHP_URL_PASS)
                    || ($key === 'notify_url' && !in_array(parse_url($url, PHP_URL_PORT), [null, 443], true))) {
                    $missing[] = "https_$key";
                }
        }
        if ($method === 'atm' && filter_var(config('tappay.atm_expire_in_days'), FILTER_VALIDATE_INT,
            ['options' => ['min_range' => 1, 'max_range' => 7]]) === false) $missing[] = 'valid_atm_expire_in_days';
        $enabled = (bool) config('tappay.enabled') && ($method === 'card' || (bool) config('tappay.'.$method.'_enabled'));

        return [
            'enabled' => $enabled,
            'ready' => $enabled && config('tappay.environment') === 'sandbox' && !$missing,
            'environment' => config('tappay.environment'),
            'app_id' => (int) config('tappay.app_id'),
            'app_key' => config('tappay.app_key'),
            'three_domain_secure' => $method === 'card' && (bool) config('tappay.three_domain_secure'),
            'min_amount' => $method === 'atm' ? 16 : 1,
            'max_amount' => $method === 'atm' ? 49999 : 199999,
            'missing' => array_values(array_unique($missing)),
        ];
    }

    public function assertReady(string $method = 'card'): void
    {
        abort_unless($this->methodConfiguration($method)['ready'], 503, '此付款方式的 TapPay 測試環境尚未啟用或設定完成。');
    }

    public function assertConnectionReady(): void
    {
        // Existing transactions must remain queryable when a method is disabled for new orders.
        abort_unless(config('tappay.enabled') && config('tappay.environment') === 'sandbox'
            && is_string(config('tappay.partner_key')) && config('tappay.partner_key') !== '',
            503, 'TapPay 測試環境連線設定尚未完成。');
    }

    public function request(string $operation, array $payload): array
    {
        $this->assertConnectionReady();
        // Payment and Record APIs have different prefixes; do not derive one from the other.
        $endpoint = match ($operation) {
            'pay-by-prime' => 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime',
            'query' => 'https://sandbox.tappaysdk.com/tpc/transaction/query',
            default => throw new RuntimeException('Unsupported TapPay operation.'),
        };
        // Capture the actual outgoing payment fields, not a second read of .env/config.
        // Queries have no top-level merchant_id or 3D setting; leave their context empty.
        $requestContext = [];
        if ($operation === 'pay-by-prime') {
            $merchantId = $payload['merchant_id'] ?? null;
            $requestContext = [
                'merchant_id' => is_string($merchantId)
                    && preg_match('/\A[A-Za-z0-9_-]{1,64}\z/', $merchantId) === 1
                    && $merchantId !== config('tappay.partner_key')
                    && $merchantId !== config('tappay.app_key') ? $merchantId : '[missing_or_omitted]',
                'three_domain_secure' => is_bool($payload['three_domain_secure'] ?? null)
                    ? $payload['three_domain_secure'] : null,
            ];
        }
        // Never retry payment automatically; a timeout may already have been authorized.
        // Do not log request bodies, prime, partner key, or raw gateway responses.
        try {
            $response = Http::asJson()->acceptJson()->connectTimeout(10)->timeout(35)
                ->withoutRedirecting()->withHeaders(['x-api-key' => config('tappay.partner_key')])
                ->post($endpoint,
                    array_merge($payload, ['partner_key' => config('tappay.partner_key')]));
        } catch (Throwable) {
            $this->diagnose($operation, 'transport_exception', requestContext: $requestContext);
            // Do not chain the original exception: it may contain request credentials.
            throw new RuntimeException('TapPay connection failure.');
        }
        // Inspect error responses too: a non-2xx response may contain a provider code.
        // Only allowlisted metadata reaches the diagnostic log, never the raw body/header.
        $mediaType = strtolower(trim(explode(';', $response->header('Content-Type'))[0]));
        $contentType = match ($mediaType) {
            'application/json', 'application/problem+json', 'text/html',
            'application/xhtml+xml', 'text/plain' => $mediaType,
            '' => 'missing',
            default => 'other',
        };
        try {
            $data = $response->json();
        } catch (Throwable) {
            $data = null;
        }
        $providerStatus = is_array($data) && is_int($data['status'] ?? null) ? $data['status'] : null;
        $providerMessage = is_array($data) ? ($data['msg'] ?? $data['message'] ?? null) : null;
        $bodyFormat = is_array($data) ? 'json_container' : 'non_container_or_invalid_json';

        // Avoid throw(): Laravel HTTP exceptions can embed sensitive upstream response data.
        if (!$response->successful()) {
            $this->diagnose($operation, 'http_error', $response->status(), $providerStatus, $providerMessage, $contentType, $bodyFormat, $this->errorDetails($data, $payload), $requestContext);
            // Diagnostic parsing must not turn an HTTP failure into an accepted payment.
            throw new RuntimeException('TapPay transport failure.');
        }
        if ($providerStatus === null) {
            $this->diagnose($operation, 'invalid_response', $response->status(), null, null, $contentType, $bodyFormat, $this->errorDetails($data, $payload), $requestContext);
            throw new RuntimeException('Invalid TapPay response.');
        }
        // End of list is normal for Record API only, not a payment success code.
        if ($data['status'] !== 0 && !($operation === 'query' && $data['status'] === 2)) {
            $this->diagnose($operation, 'provider_error', $response->status(), $providerStatus, $providerMessage, $contentType, $bodyFormat, $this->errorDetails($data, $payload), $requestContext);
        }
        return $data;
    }

    private function errorDetails(mixed $data, array $payload): array
    {
        if (!is_array($data)) return [];
        try {
            $secrets = [];
            // Remove all submitted string values, including names, addresses, primes and URLs.
            array_walk_recursive($payload, static function ($value) use (&$secrets): void {
                if (is_string($value) && $value !== '') $secrets[] = $value;
            });
            foreach (['partner_key', 'app_key', 'merchant_id', 'return_url', 'notify_url'] as $key) {
                $value = config("tappay.$key");
                if (is_string($value) && $value !== '') $secrets[] = $value;
            }
            usort($secrets, static fn ($a, $b) => strlen($b) <=> strlen($a));
            $details = [];
            // Inspect only these scalar fields, never dump arbitrary nested response data.
            $fields = ['status', 'code', 'error_code', 'errorCode', 'msg', 'message', 'error_description', 'error'];
            $containers = ['' => $data];
            if (is_array($data['error'] ?? null)) $containers['error.'] = $data['error'];
            foreach ($containers as $prefix => $container) {
                foreach ($fields as $field) {
                    $value = $container[$field] ?? null;
                    if (!is_string($value) && !is_int($value)) continue;
                    $text = (string) $value;
                    // Long messages or embedded objects can be echoed payloads: omit entirely.
                    if (strlen($text) > 1024 || str_contains($text, '{') || str_contains($text, '<')) {
                        $details[$prefix.$field] = '[omitted]';
                        continue;
                    }
                    $text = rawurldecode($text);
                    $text = str_ireplace($secrets, '[redacted]', $text);
                    $text = preg_replace([
                        '~https?://[^\s]+~i',
                        '~[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}~i',
                        '~\b(?:partner|prime|token|bearer)[_:= -]+[A-Za-z0-9._+/=-]+~i',
                        '~\b[A-Za-z0-9_+/=-]{20,}\b~',
                        '~\+?\d[\d ()-]{6,}\d~',
                        '~\b\d{1,3}(?:\.\d{1,3}){3}\b~',
                    ], '[redacted]', $text);
                    if ($text === null) { $details[$prefix.$field] = '[omitted]'; continue; }
                    $text = preg_replace('/[\x00-\x1F\x7F]+/', ' ', $text);
                    $details[$prefix.$field] = mb_substr($text ?? '[omitted]', 0, 300);
                }
            }
            return $details;
        } catch (Throwable) {
            return ['diagnostic' => 'details_omitted'];
        }
    }

    private function diagnose(string $operation, string $failure, ?int $httpStatus = null, ?int $providerStatus = null, mixed $message = null, ?string $contentType = null, ?string $bodyFormat = null, array $safeDetails = [], array $requestContext = []): void
    {
        // Free-form provider messages may echo keys, cardholder details or tokens.
        // Emit only fixed topic labels, never the message or regex captures.
        $topics = [];
        if (is_string($message)) {
            $message = substr($message, 0, 4096);
            foreach ([
                'ip_or_network' => '/\b(ip|whitelist|white list|ip_address)\b/i',
                'credentials' => '/\b(partner[ _-]?key|api[ _-]?key|authentication|credential)\b/i',
                'merchant' => '/\bmerchant(?:[ _-]?id)?\b/i',
                'permissions' => '/\b(permission|unauthorized|forbidden|access denied)\b/i',
                'request_parameters' => '/\b(parameter|param|filter|format|invalid|missing)\b/i',
                'rate_limit' => '/\b(rate limit|too many requests)\b/i',
            ] as $topic => $pattern) {
                if (preg_match($pattern, $message) === 1) $topics[] = $topic;
            }
        }
        try {
            // Local-only channel avoids sending diagnostics to configured external log sinks.
            Log::build([
                'driver' => 'daily', 'path' => storage_path('logs/tappay-diagnostics.log'),
                'level' => 'warning', 'days' => 14, 'permission' => 0600,
            ])->warning('TapPay request failed', [
                'operation' => $operation, 'environment' => 'sandbox', 'failure' => $failure,
                'http_status' => $httpStatus, 'tappay_status' => $providerStatus,
                'content_type' => $contentType, 'body_format' => $bodyFormat,
                'message_topics' => $topics ?: ['unclassified'],
                'safe_error_details' => $safeDetails,
                'request_context' => $requestContext,
            ]);
        } catch (Throwable) {
            // Diagnostics must never interrupt payment reconciliation or cause a retry.
        }
    }
}
