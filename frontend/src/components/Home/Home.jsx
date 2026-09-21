import HomeHeading from "./HomeHeading";
import { useUser } from "../../context/UserContext";
import { checkIsAdmin } from "../../utils/roles";

const Home = () => {
  const { user } = useUser();
  const isAdmin = checkIsAdmin(user);

  console.log("Home.jsx - User:", user);
  console.log("Home.jsx - isAdmin:", isAdmin);

  return (
    <>
      <HomeHeading />
    </>
  );
};

export default Home;
