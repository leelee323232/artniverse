<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TapPayPaymentAttempt extends Model
{
    protected $table = 'tappay_payment_attempts';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = ['id'];
    protected $hidden = ['notify_token_hash', 'merchant_id'];

    protected function casts(): array
    {
        return ['gateway_status' => 'integer', 'record_status' => 'integer'];
    }
}
