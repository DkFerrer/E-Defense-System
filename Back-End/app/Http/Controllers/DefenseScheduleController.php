<?php

namespace App\Http\Controllers;

use App\Models\DefenseSchedule;
use Illuminate\Http\Request;

class DefenseScheduleController extends Controller
{
    public function index()
    {
        return response()->json(DefenseSchedule::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'stage' => 'required|string',
            'title' => 'required|string',
            'date' => 'required|string',
            'dateIso' => 'required|string',
            'startTime' => 'required|string',
            'endTime' => 'required|string',
            'venue' => 'required|string',
            'researchers' => 'required|array',
            'panelists' => 'required|array',
            'approvedConcept' => 'boolean',
            'paymentReceipt' => 'boolean',
            'messageHtml' => 'nullable|string',
        ]);

        $schedule = DefenseSchedule::create($validated);
        return response()->json($schedule, 201);
    }

    public function destroy($id)
    {
        $schedule = DefenseSchedule::findOrFail($id);
        $schedule->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
