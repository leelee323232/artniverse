<?php
namespace Database\Factories;
use App\Models\Creator;
use Illuminate\Database\Eloquent\Factories\Factory;
class CreatorFactory extends Factory{
protected $model = Creator::class;
public function definition(){
return [
'name'=>$this->faker->company,
'description'=>$this->faker->sentence,
'tags'=>json_encode($this->faker->randomElements(['設計','手作','限量','潮流','藝術'],3)),
'followers'=>$this->faker->numberBetween(0,20000),
'rating'=>round($this->faker->randomFloat(2,0,5),2),
'total_reviews'=>$this->faker->numberBetween(0,500),
'color'=>$this->faker->hexcolor,
'super_subscription'=>json_encode([
'monthly'=>$this->faker->randomElement([99,199,299]),
'benefits'=>['免運','優先發貨','限定商品']
]),
];
}
}