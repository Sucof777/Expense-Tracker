<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $r)
    {
        try {
            Log::info('Registration attempt', ['data' => $r->all()]);

            $data = $r->validate([
                'first_name' => ['required', 'string', 'max:100'],
                'last_name' => ['required', 'string', 'max:100'],
                'email' => ['required', 'email', 'unique:users,email'],
                'password' => ['required', Password::min(6)]
            ]);

            $user = User::create([
                'name' => $data['first_name'] . ' ' . $data['last_name'],
                'email' => $data['email'],
                'password' => bcrypt($data['password'])
            ]);

            return response()->json([
                'message' => 'Registered successfully',
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            Log::error('Registration failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $r)
    {
        $r->validate(['email' => 'required|email', 'password' => 'required']);
        if (!Auth::attempt($r->only('email', 'password'), true)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }
        $r->session()->regenerate();
        return response()->json(['user' => Auth::user()]);
    }

    public function me(Request $r)
    {
        return response()->json($r->user());
    }

    public function logout(Request $r)
    {
        Auth::guard('web')->logout();
        $r->session()->invalidate();
        $r->session()->regenerateToken();
        return response()->json(['message' => 'Logged out']);
    }
}
