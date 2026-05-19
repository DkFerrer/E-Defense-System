<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('defense_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('stage');
            $table->text('title');
            $table->string('date');
            $table->string('dateIso');
            $table->string('startTime');
            $table->string('endTime');
            $table->string('venue');
            $table->json('researchers');
            $table->json('panelists');
            $table->boolean('approvedConcept')->default(false);
            $table->boolean('paymentReceipt')->default(false);
            $table->longText('messageHtml')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('defense_schedules');
    }
};
