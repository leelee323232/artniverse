<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CheckoutOrder extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = ['id'];
    protected $hidden = ['contact', 'request_hash', 'idempotency_key'];

    public function latestPaymentAttempt(): HasOne
    {
        // Attempt sequence, rather than UUID or timestamp, identifies the latest payment.
        return $this->hasOne(TapPayPaymentAttempt::class, 'checkout_order_id')->ofMany('attempt_number', 'max');
    }

    protected function casts(): array
    {
        return ['items' => 'array', 'contact' => 'encrypted:array', 'expires_at' => 'datetime',
            'subtotal' => 'integer', 'shipping' => 'integer', 'total' => 'integer'];
    }
}
