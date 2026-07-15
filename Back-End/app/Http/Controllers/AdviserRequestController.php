<?php

namespace App\Http\Controllers;

use App\Models\AdviserAcceptanceRequest;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;

class AdviserRequestController extends Controller
{
    /**
     * Display a listing of adviser acceptance requests.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = AdviserAcceptanceRequest::with(['student', 'statusUpdatedBy']);

        // Filter based on user role
        if ($user->role === 'student_researcher') {
            $query->where('student_id', $user->id);
        } elseif ($user->role === 'adviser') {
            $query->where('adviser_email', $user->email);
        }

        // Optional status filter
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $requests = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $requests->items(),
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
            ],
        ]);
    }

    /**
     * Store a newly created adviser acceptance request.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'research_title' => 'required|string|max:255',
            'research_area' => 'required|string|max:255',
            'research_objectives' => 'nullable|string',
            'group_members' => 'nullable|string',
            'adviser_name' => 'required|string|max:255',
            'adviser_email' => 'required|email',
            'expected_defense_date' => 'nullable|string|max:255',
            'document_url' => 'nullable|string|url',
        ]);

        $validated['student_id'] = $request->user()->id;
        $validated['status'] = 'pending';

        $adviserRequest = AdviserAcceptanceRequest::create($validated);

        // Create notification for the adviser
        $adviser = User::where('email', $validated['adviser_email'])->first();
        if ($adviser) {
            Notification::create([
                'user_id' => $adviser->id,
                'type' => 'adviser_request',
                'title' => 'New Adviser Acceptance Request',
                'message' => $request->user()->first_name . ' ' . $request->user()->last_name .
                    ' has submitted a research proposal: "' . $validated['research_title'] . '".',
                'is_read' => false,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $adviserRequest->load('student'),
            'message' => 'Request submitted successfully.',
        ], 201);
    }

    /**
     * Display the specified adviser acceptance request.
     */
    public function show(Request $request, $id)
    {
        $adviserRequest = AdviserAcceptanceRequest::with(['student', 'statusUpdatedBy'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $adviserRequest,
        ]);
    }

    /**
     * Update the status of an adviser acceptance request (approve/reject).
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string',
        ]);

        $adviserRequest = AdviserAcceptanceRequest::findOrFail($id);

        $adviserRequest->update([
            'status' => $validated['status'],
            'status_updated_at' => now(),
            'status_updated_by' => $request->user()->id,
            'rejection_reason' => $validated['rejection_reason'] ?? null,
        ]);

        // Notify the student about the status change
        $statusLabel = $validated['status'] === 'rejected' ? 'Returned' : 'Approved';
        $actionLabel = $validated['status'] === 'rejected' ? 'returned' : 'approved';
        Notification::create([
            'user_id' => $adviserRequest->student_id,
            'type' => 'request_' . $validated['status'],
            'title' => "Research Proposal {$statusLabel}",
            'message' => "Your research proposal \"{$adviserRequest->research_title}\" has been {$actionLabel} by {$request->user()->first_name} {$request->user()->last_name}." .
                ($validated['status'] === 'rejected' && !empty($validated['rejection_reason'])
                    ? " Reason: {$validated['rejection_reason']}"
                    : ''),
            'is_read' => false,
        ]);

        return response()->json([
            'success' => true,
            'data' => $adviserRequest->fresh()->load(['student', 'statusUpdatedBy']),
            'message' => "Request {$statusLabel} successfully.",
        ]);
    }

    /**
     * Reset a request status back to pending (undo approve/reject).
     */
    public function resetStatus(Request $request, $id)
    {
        $adviserRequest = AdviserAcceptanceRequest::findOrFail($id);

        $adviserRequest->update([
            'status' => 'pending',
            'status_updated_at' => null,
            'status_updated_by' => null,
            'rejection_reason' => null,
        ]);

        return response()->json([
            'success' => true,
            'data' => $adviserRequest->fresh()->load(['student', 'statusUpdatedBy']),
            'message' => 'Request reset to pending successfully.',
        ]);
    }
}
