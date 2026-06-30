export type UserRole = "parent" | "admin";

export type SkillLevel =
  | "New swimmer"
  | "Beginner"
  | "Intermediate"
  | "Advanced stroke technique";

export type StudentCount = "1" | "2" | "special_request";

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
};

export type Instructor = {
  id: string;
  name: string;
  color: "blue" | "green";
  bio: string | null;
  active: boolean;
};

export type Swimmer = {
  id: string;
  parent_user_id: string | null;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  swimmer_name: string;
  swimmer_age: number | null;
  skill_level: SkillLevel;
  comments: string | null;
  admin_notes: string | null;
  created_at: string;
};

export type AvailabilitySlot = {
  id: string;
  instructor_id: string;
  starts_at: string;
  is_booked: boolean;
  created_at: string;
};

export type Booking = {
  id: string;
  availability_slot_id: string;
  parent_user_id: string | null;
  swimmer_id: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  number_of_students: StudentCount;
  skill_level: SkillLevel;
  comments: string | null;
  status: "confirmed" | "cancelled";
  created_at: string;
};

export type LessonNote = {
  id: string;
  booking_id: string;
  swimmer_id: string;
  instructor_id: string | null;
  note: string;
  created_by: string | null;
  created_at: string;
};

export type BookingSlot = {
  id: string;
  starts_at: string;
  instructor_id: string;
  is_booked: boolean;
  instructors: Instructor | null;
};

export type BookingWithDetails = Booking & {
  availability_slots:
    | (Pick<AvailabilitySlot, "id" | "starts_at" | "instructor_id"> & {
        instructors: Pick<Instructor, "id" | "name" | "color"> | null;
      })
    | null;
  swimmers: Pick<Swimmer, "id" | "swimmer_name" | "swimmer_age"> | null;
};

export type SwimmerWithBookings = Swimmer & {
  bookings: BookingWithDetails[];
  lesson_notes: (LessonNote & {
    instructors: Pick<Instructor, "name"> | null;
  })[];
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Omit<Profile, "created_at">> & { id: string };
        Update: Partial<Omit<Profile, "id" | "created_at">>;
        Relationships: [];
      };
      instructors: {
        Row: Instructor;
        Insert: Partial<Instructor> & Pick<Instructor, "name" | "color">;
        Update: Partial<Instructor>;
        Relationships: [];
      };
      swimmers: {
        Row: Swimmer;
        Insert: Partial<Omit<Swimmer, "id" | "created_at">> &
          Pick<Swimmer, "parent_name" | "parent_email" | "parent_phone" | "swimmer_name" | "skill_level">;
        Update: Partial<Omit<Swimmer, "id" | "created_at">>;
        Relationships: [];
      };
      availability_slots: {
        Row: AvailabilitySlot;
        Insert: Partial<Omit<AvailabilitySlot, "id" | "created_at">> &
          Pick<AvailabilitySlot, "instructor_id" | "starts_at">;
        Update: Partial<Omit<AvailabilitySlot, "id" | "created_at">>;
        Relationships: [];
      };
      bookings: {
        Row: Booking;
        Insert: Partial<Omit<Booking, "id" | "created_at">> &
          Pick<
            Booking,
            | "availability_slot_id"
            | "swimmer_id"
            | "parent_name"
            | "parent_email"
            | "parent_phone"
            | "number_of_students"
            | "skill_level"
          >;
        Update: Partial<Omit<Booking, "id" | "created_at">>;
        Relationships: [];
      };
      lesson_notes: {
        Row: LessonNote;
        Insert: Partial<Omit<LessonNote, "id" | "created_at">> & Pick<LessonNote, "booking_id" | "swimmer_id" | "note">;
        Update: Partial<Omit<LessonNote, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      book_lesson: {
        Args: {
          p_slot_id: string;
          p_parent_name: string;
          p_parent_email: string;
          p_parent_phone: string;
          p_swimmer_id?: string | null;
          p_swimmer_name: string;
          p_swimmer_age?: number | null;
          p_number_of_students: StudentCount;
          p_skill_level: SkillLevel;
          p_comments?: string | null;
        };
        Returns: string;
      };
      create_availability_slot: {
        Args: {
          p_instructor_id: string;
          p_starts_at_local: string;
        };
        Returns: string;
      };
      delete_availability_slot: {
        Args: {
          p_slot_id: string;
        };
        Returns: boolean;
      };
      ensure_current_user_profile: {
        Args: {
          p_full_name?: string | null;
          p_phone?: string | null;
        };
        Returns: Profile;
      };
      mark_availability_unavailable: {
        Args: {
          p_slot_id: string;
        };
        Returns: boolean;
      };
      is_admin: {
        Args: {
          user_id?: string | null;
        };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
