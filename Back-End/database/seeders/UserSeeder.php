<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ─── Demo Accounts ────────────────────────────────────────────
        // Dean Demo Account  |  email: dean.demo@unc.edu.ph  |  password: demo1234
        User::create([
            'first_name' => 'Demo',
            'last_name' => 'Dean',
            'email' => 'dean.demo@unc.edu.ph',
            'password' => Hash::make('demo1234'),
            'role' => 'dean',
            'department' => 'Dean Office',
            'college' => 'College of Engineering',
        ]);

        // Adviser Demo Account  |  email: adviser.demo@unc.edu.ph  |  password: demo1234
        User::create([
            'first_name' => 'Demo',
            'last_name' => 'Adviser',
            'email' => 'adviser.demo@unc.edu.ph',
            'password' => Hash::make('demo1234'),
            'role' => 'adviser',
            'department' => 'Computer Science',
            'college' => 'College of Engineering',
        ]);

        // Create admin user
        User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@unc.edu.ph',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'department' => 'Administration',
            'college' => 'University Administration',
        ]);

        // ─── Advisers ────────────────────────────────────────────────
        User::create([
            'first_name' => 'Maria Arka',
            'last_name' => 'Danila',
            'email' => 'maria.danila@unc.edu.ph',
            'password' => Hash::make('password123'),
            'role' => 'adviser',
            'department' => 'Computer Science',
            'college' => 'College of Engineering',
        ]);

        User::create([
            'first_name' => 'Junar',
            'last_name' => 'Danila',
            'email' => 'junar.danila@unc.edu.ph',
            'password' => Hash::make('password123'),
            'role' => 'adviser',
            'department' => 'Computer Science',
            'college' => 'College of Engineering',
        ]);

        User::create([
            'first_name' => 'Joenhel',
            'last_name' => 'Arcilla',
            'email' => 'joenhel.arcilla@unc.edu.ph',
            'password' => Hash::make('password123'),
            'role' => 'adviser',
            'department' => 'Computer Science',
            'college' => 'College of Engineering',
        ]);

        User::create([
            'first_name' => 'Danny',
            'last_name' => 'Casimero',
            'email' => 'danny.casimero@unc.edu.ph',
            'password' => Hash::make('password123'),
            'role' => 'adviser',
            'department' => 'Computer Science',
            'college' => 'College of Engineering',
        ]);

        User::create([
            'first_name' => 'Chin',
            'last_name' => 'Borela',
            'email' => 'chin.borela@unc.edu.ph',
            'password' => Hash::make('password123'),
            'role' => 'adviser',
            'department' => 'Computer Science',
            'college' => 'College of Engineering',
        ]);

        User::create([
            'first_name' => 'Dennis',
            'last_name' => 'Ignacio',
            'email' => 'dennis.ignacio@unc.edu.ph',
            'password' => Hash::make('password123'),
            'role' => 'adviser',
            'department' => 'Computer Science',
            'college' => 'College of Engineering',
        ]);

        // ─── Dean ────────────────────────────────────────────────────
        User::create([
            'first_name' => 'Agnes',
            'last_name' => 'Reyes',
            'email' => 'agnes.reyes@unc.edu.ph',
            'password' => Hash::make('password123'),
            'role' => 'dean',
            'department' => 'Dean Office',
            'college' => 'College of Engineering',
        ]);

        // ─── Student Researchers ─────────────────────────────────────
        User::create([
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan.delacruz@student.unc.edu.ph',
            'password' => Hash::make('password123'),
            'role' => 'student_researcher',
            'department' => 'Computer Science',
            'college' => 'College of Engineering',
        ]);

        User::create([
            'first_name' => 'Maria',
            'last_name' => 'Garcia',
            'email' => 'maria.garcia@student.unc.edu.ph',
            'password' => Hash::make('password123'),
            'role' => 'student_researcher',
            'department' => 'Information Technology',
            'college' => 'College of Engineering',
        ]);

        User::create([
            'first_name' => 'Pedro',
            'last_name' => 'Reyes',
            'email' => 'pedro.reyes@student.unc.edu.ph',
            'password' => Hash::make('password123'),
            'role' => 'student_researcher',
            'department' => 'Computer Science',
            'college' => 'College of Engineering',
        ]);
    }
}
