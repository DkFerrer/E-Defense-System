<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DefenseSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'stage',
        'title',
        'date',
        'dateIso',
        'startTime',
        'endTime',
        'venue',
        'researchers',
        'panelists',
        'approvedConcept',
        'paymentReceipt',
        'messageHtml',
    ];

    protected $casts = [
        'researchers' => 'array',
        'panelists' => 'array',
        'approvedConcept' => 'boolean',
        'paymentReceipt' => 'boolean',
    ];
}
