export type GuestbookEntry = {
  id: number;
  name: string;
  email: string | null;
  message: string;
  submitted_at: string;
}
