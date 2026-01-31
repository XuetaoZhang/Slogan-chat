import Authentication from "@/components/auth/Authentication";
import MainPage from "@/components/MainPage";
export default function Home() {
  return (
    <Authentication>
      <MainPage />
    </Authentication>
  );
}
