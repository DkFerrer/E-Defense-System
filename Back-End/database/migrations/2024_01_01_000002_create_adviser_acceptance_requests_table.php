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
        Schema::create('adviser_acceptance_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('research_title');
            $table->string('research_area');
            $table->text('research_objectives')->nullable();
            $table->text('group_members')->nullable();
            $table->string('adviser_name');
            $table->string('adviser_email');
            $table->string('expected_defense_date')->nullable();
            $table->string('document_url')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamp('status_updated_at')->nullable();
            $table->foreignId('status_updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adviser_acceptance_requests');
    }
};
