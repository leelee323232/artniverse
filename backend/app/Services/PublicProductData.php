<?php

namespace App\Services;

use App\Models\Product;

// Shared by the shop and creator product lists to keep specifications identical.
class PublicProductData
{
    public function serialize(Product $product): array
    {
        // Normalize only the public response. Admin writes still use the original JSON columns.
        $data = $product->toArray();
        $specifications = $this->decoded($product->specifications);
        $display = [];
        if (is_array($specifications)) {
            foreach ($specifications as $key => $value) {
                $text = $this->displayValue($value);
                if ($text !== '') $display[(string) $key] = $text;
            }
        }

        foreach (['styles' => '款式', 'sizes' => '尺寸', 'colors' => '顏色'] as $field => $title) {
            $options = $this->decoded($product->$field);
            $normalized = [];
            if (is_array($options) && array_is_list($options)) {
                foreach ($options as $option) {
                    if (! is_array($option) || ! is_string($option['label'] ?? null)) continue;
                    $label = trim($option['label']);
                    if ($label === '') continue;
                    $entry = ['label' => $label];
                    if (is_string($option['id'] ?? null) || is_int($option['id'] ?? null)) {
                        $entry['id'] = (string) $option['id'];
                    }
                    if ($field === 'colors' && is_string($option['hex'] ?? null)
                        && preg_match('/^#[0-9a-fA-F]{6}$/D', $option['hex'])) {
                        $entry['hex'] = strtoupper($option['hex']);
                    }
                    $normalized[] = $entry;
                }
            }
            $data[$field] = $normalized;
            // Current option labels take precedence over a stale same-name display specification.
            // This is a display summary, not a SKU or an order selection.
            if ($normalized !== []) {
                $display[$title] = implode('、', array_unique(array_column($normalized, 'label')));
            }
        }
        // Keep an object even when empty, matching the existing product page's key/value table.
        $data['specifications'] = (object) $display;
        return $data;
    }

    private function decoded(mixed $value): mixed
    {
        return is_string($value) ? json_decode($value, true) : $value;
    }

    private function displayValue(mixed $value): string
    {
        if (is_string($value)) return trim($value);
        if (is_int($value) || is_float($value)) return (string) $value;
        if (is_bool($value)) return $value ? '是' : '否';
        if (is_array($value)) {
            $parts = [];
            $list = array_is_list($value);
            foreach ($value as $key => $item) {
                $text = $this->displayValue($item);
                if ($text !== '') $parts[] = $list ? $text : $key.'：'.$text;
            }
            return implode('、', $parts);
        }
        return '';
    }
}
