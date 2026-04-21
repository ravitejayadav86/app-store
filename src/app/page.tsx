import HomeClient from "./HomeClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  verification: {
    google: "_Assj4YRHJKEq7XPBuD9eGICbxrauR6CNxdBpI8UVtc",
  },
};

export default function Page() {
  return <HomeClient />;
}
