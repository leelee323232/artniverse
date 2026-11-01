<?php

return [
    // Dedicated private disk. Never point this at the public image bucket.
    'disk' => env('CREATOR_DOCUMENT_DISK', 'creator_documents'),
    'contract_version' => '2026-11-01',
    'categories' => [
        'T-shirt / 上衣', '帽子', '托特包 / 袋類', '襪子', '貼紙', '明信片',
        '海報', '筆記本 / 文具', '手機殼', '馬克杯 / 杯墊', '鑰匙圈 / 吊飾',
        '抱枕', '地墊', '其他（請於創作理念欄補充說明）',
    ],
];
