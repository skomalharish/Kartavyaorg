import { createFileRoute, Link } from "@tanstack/react-router";
import { BookingPanel, Empty, PageTitle } from "@/components/kartavya";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/customer/bookings")({ component: Bookings });

function Bookings() {
  const bookings = useStore((s) => s.bookings.filter((b) => b.customerName === s.session?.name));
  return (
    <div>
      <PageTitle title="My bookings" sub="Track status, approve extra charges, confirm completion and view bills." right={<Link to="/customer/find" className="k-btn k-btn-accent">New booking</Link>} />
      <div className="space-y-4">
        {bookings.length === 0 ? <Empty>You have no bookings yet.</Empty> : bookings.map((b) => <BookingPanel key={b.id} b={b} viewer="customer" />)}
      </div>
    </div>
  );
}
