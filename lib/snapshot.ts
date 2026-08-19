import competitions from "@/data/competitions.json";
import economics from "@/data/economics.json";
import fleet from "@/data/fleet.json";
import geo from "@/data/geo.json";
import partners from "@/data/partners.json";
import people from "@/data/people.json";
import portfolio from "@/data/portfolio.json";
import products from "@/data/products.json";
import quality from "@/data/quality.json";
import replacements from "@/data/replacements.json";

/**
 * The date the page reports for its own figures.
 *
 * Each data file carries its own capture date, and they drift apart as one is
 * refreshed and another is not. Naming a single file's date — this page used
 * to print the fleet's — quietly backdates everything newer than it, which on
 * a page whose whole argument is where its numbers come from is the one kind
 * of error worth wiring shut. So the page names the newest capture and says
 * so: the figures come from snapshots, the newest dated this.
 *
 * ISO dates sort lexicographically, so a string compare is the whole job.
 */
const CAPTURES: string[] = [
  competitions.capturedAt,
  economics.measuredAt,
  fleet.capturedAt,
  geo.capturedAt,
  partners.capturedAt,
  people.capturedAt,
  portfolio.capturedAt,
  products.capturedAt,
  quality.measuredAt,
  replacements.capturedAt,
];

export const NEWEST_SNAPSHOT: string = CAPTURES.reduce((a, b) => (a > b ? a : b));
