
import { Layout } from "@/components/layout/Layout";
import { BookingsList } from "@/components/bookings/BookingsList";

export default function MyBookings() {
  return (
    <Layout title="My Bookings">
      <BookingsList />
    </Layout>
  );
}
