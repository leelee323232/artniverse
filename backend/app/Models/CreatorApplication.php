<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CreatorApplication extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['bank_account', 'id_front_image', 'id_back_image', 'request_hash', 'contract_snapshot'];

    protected function casts(): array
    {
        return [
            'selected_categories' => 'array',
            'agree_to_contract' => 'boolean',
            'birthday' => 'date:Y-m-d',
            'consented_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'version' => 'integer',
        ];
    }
}
