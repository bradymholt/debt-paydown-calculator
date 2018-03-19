import fontawesome from "@fortawesome/fontawesome";
import {
  faDollarSign,
  faPercent,
  faMoneyBillAlt
} from "@fortawesome/fontawesome-free-solid";

export function load() {
  fontawesome.library.add(faDollarSign, faPercent, faMoneyBillAlt);
}
