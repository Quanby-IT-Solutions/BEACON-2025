import HeaderHolder from "@/components/reuseable/Header/HeaderHolder";

export const metadata = {
  title: "New page title here",
  description: "Sample description",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <HeaderHolder />
      {children}
    </div>
  );
}
