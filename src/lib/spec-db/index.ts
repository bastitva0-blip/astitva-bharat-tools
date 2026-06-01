// Spec DB — typed loader.
//
// JSON is imported statically so Next can tree-shake and embed the data at
// build time. Runtime validation runs once at module load; if any record is
// malformed the module throws and surfaces during build/dev, not at request
// time.
//
// To add a portal spec: drop a JSON file in data/photo/ or data/document/,
// then add its import below. Keep `lastVerifiedAt` honest — it surfaces on
// the spec-reference pages as a credibility signal (marketing-plan §2.1).

import { assertPhotoSpec, type PhotoSpec, type SpecDbVersion } from "./schema";

import upsc from "./data/photo/upsc.json";
import ssc from "./data/photo/ssc.json";
import neet from "./data/photo/neet.json";
import ibps from "./data/photo/ibps.json";
import railway from "./data/photo/railway.json";
import jee from "./data/photo/jee.json";
import statePsc from "./data/photo/state-psc.json";
import police from "./data/photo/police.json";
import sbi from "./data/photo/sbi.json";

import aadhaar from "./data/document/aadhaar.json";
import pan from "./data/document/pan.json";
import passport from "./data/document/passport.json";
import voterId from "./data/document/voter-id.json";
import oci from "./data/document/oci.json";

import versionData from "./version.json";

const photoRaw: unknown[] = [upsc, ssc, neet, ibps, railway, jee, statePsc, police, sbi];
const documentRaw: unknown[] = [aadhaar, pan, passport, voterId, oci];

function loadAll(raw: unknown[], dir: string): PhotoSpec[] {
  return raw.map((r, i) => {
    const source = `${dir}[${i}]`;
    assertPhotoSpec(r, source);
    return r;
  });
}

export const photoSpecs: PhotoSpec[] = loadAll(photoRaw, "photo");
export const documentSpecs: PhotoSpec[] = loadAll(documentRaw, "document");

export const allSpecs: PhotoSpec[] = [...photoSpecs, ...documentSpecs];

export const specDbVersion: SpecDbVersion = versionData as SpecDbVersion;

export function getPhotoSpec(slug: string): PhotoSpec | undefined {
  return photoSpecs.find((s) => s.slug === slug);
}

export function getDocumentSpec(slug: string): PhotoSpec | undefined {
  return documentSpecs.find((s) => s.slug === slug);
}

export type { PhotoSpec, SpecDbVersion } from "./schema";
