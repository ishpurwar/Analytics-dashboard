import { analytics } from "@/utils/analytics";

const page = async () => {
  const pageview = await analytics.retrieve("pageview", "14/02/2024");
  return <div>{JSON.stringify(pageview)}</div>;
};

export default page;
