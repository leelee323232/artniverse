<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class TapPayClient
{
    public function configuration(): array
    {
        $missing = [];
        foreach (['app_id', 'app_key', 'partner_key', 'merchant_id', 'shipping_fee'] as $key) {
            if (config("tappay.$key") === null || config("tappay.$key") === '') {
                $missing[] = $key;
            }
        }
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
        if (config('tappay.three_domain_secure')) {
            foreach (['return_url', 'notify_url'] as $key) {
                $url = config("tappay.$key");
                if (!filter_var($url, FILTER_VALIDATE_URL) || parse_url($url, PHP_URL_SCHEME) !== 'https'
                    || parse_url($url, PHP_URL_QUERY) || parse_url($url, PHP_URL_FRAGMENT)) {
                    $missing[] = "https_$key";
                }
            }
        }

        return [
            'enabled' => (bool) config('tappay.enabled'),
            'ready' => config('tappay.enabled') && config('tappay.environment') === 'sandbox' && !$missing,
            'environment' => config('tappay.environment'),
            'methods' => ['card'],
            'app_id' => (int) config('tappay.app_id'),
            'app_key' => config('tappay.app_key'),
            'three_domain_secure' => (bool) config('tappay.three_domain_secure'),
            'missing' => array_values(array_unique($missing)),
        ];
    }

    public function assertReady(): void
    {
        abort_unless($this->configuration()['ready'], 503, 'TapPay 測試環境尚未設定完成。');
    }

    public function request(string $operation, array $payload): array
    {
        $this->assertReady();
        if (!in_array($operation, ['pay-by-prime', 'query'], true)) {
            throw new RuntimeException('Unsupported TapPay operation.');
        }
        // Never retry payment automatically; a timeout may already have been authorized.
        // Do not log request bodies, prime, partner key, or raw gateway responses.
        $response = Http::asJson()->acceptJson()->connectTimeout(10)->timeout(35)
            ->withoutRedirecting()->withHeaders(['x-api-key' => config('tappay.partner_key')])
            ->post('https://sandbox.tappaysdk.com/tpc/transaction/'.$operation,
                array_merge($payload, ['partner_key' => config('tappay.partner_key')]));
        // Avoid throw(): Laravel HTTP exceptions can embed sensitive upstream response data.
        if (!$response->successful()) {
            throw new RuntimeException('TapPay transport failure.');
        }
        $data = $response->json();
        if (!is_array($data) || !isset($data['status']) || !is_int($data['status'])) {
            throw new RuntimeException('Invalid TapPay response.');
        }
        return $data;
    }
}
