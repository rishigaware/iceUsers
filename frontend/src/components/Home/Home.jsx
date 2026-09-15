import HomeHeading from "./HomeHeading";
import { useUser } from "../../context/UserContext";

const Home = () => {
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';

  console.log("Home.jsx - User:", user);
  console.log("Home.jsx - isAdmin:", isAdmin);

  return (
    <>
      <HomeHeading />
    </>
  );
};

export default Home;
