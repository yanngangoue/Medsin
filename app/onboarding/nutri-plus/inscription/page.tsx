import { redirect } from "next/navigation";
import { NUTRI_PLUS_PRODUCTS_PATH } from "@/lib/patient/nutri-plus-routes";

export default function NutriPlusInscriptionRedirectPage() {
  redirect(NUTRI_PLUS_PRODUCTS_PATH);
}
