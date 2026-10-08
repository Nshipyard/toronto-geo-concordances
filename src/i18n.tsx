"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "en" | "fr";

const en = {
  banner: {
    line: "An open-source civic project by Nshipyard. Not affiliated with the Government of Canada or the City of Toronto.",
    badge: "Open source",
  },
  nav: { explorer: "Explorer", splits: "The splits", developers: "Developers", data: "Data", back: "All projects" },
  hero: {
    kicker: "Nshipyard Canada · Project 01",
    title: "Every neighbourhood boundary, joined across census years.",
    sub: "Toronto's neighbourhoods were re-cut from 140 to 158 for the 2021 census. This is the canonical crosswalk: which old neighbourhoods became which new ones, by exact area overlap, plus ward concordances.",
    cta1: "Explore the map",
    cta2: "Read the methodology",
  },
  stats: [
    { value: "158", label: "neighbourhoods in the current model, each mapped to its 140-model parent" },
    { value: "16 → 34", label: "old neighbourhoods split into new ones, with exact area shares" },
    { value: "124", label: "neighbourhoods unchanged, verified by full-area overlap" },
    { value: "25", label: "wards joined: every neighbourhood sits in exactly one ward" },
  ],
  explorer: {
    kicker: "Explorer",
    title: "Find any neighbourhood, in either model.",
    search: "Search by name or code…",
    colorBy: "Color by",
    by158: "158 model",
    by140: "140 parent",
    byWard: "Ward",
    detail: {
      code158: "Neighbourhood 158",
      parent140: "Parent in the 140 model",
      ward: "Ward",
      ofArea: "of its area",
      siblings: "Split with",
      unchanged: "Unchanged in the re-cut",
      shareNote: "Share of the parent's area",
    },
    noResult: "No neighbourhood matches.",
    empty: "Click any neighbourhood on the map, or search by name or code above, to see its 140-model parent, ward, and split history.",
  },
  splits: {
    kicker: "Showcase",
    title: "The 16 neighbourhoods that became 34.",
    body: "High-growth areas were split for the 2021 census round. Before this crosswalk, comparing a 2016 neighbourhood series to 2021 and later meant hand-deriving this table. Now it is a download.",
    parent: "140 model",
    children: "158 model",
    download: "Download the crosswalk (CSV)",
  },
  developers: {
    kicker: "For developers",
    title: "Query it from code, or from an agent.",
    body: "Three consumption paths, same canonical data. REST for applications, OpenAPI for integration, MCP tools over streamable HTTP for AI agents.",
    endpoints: "Endpoints",
    tryIt: "Try it",
    openapi: "OpenAPI spec",
    mcpTitle: "MCP server",
    mcpBody: "One streamable-HTTP endpoint. Tools: geo_convert, geo_lookup, geo_splits.",
  },
  downloads: {
    kicker: "Data",
    title: "Take the files.",
    body: "Versioned releases, MIT licensed. CSV for spreadsheets, GeoJSON for maps.",
    files: [
      { name: "hood158_to_hood140.csv", desc: "158 → 140 with area shares and primary flag" },
      { name: "hood140_to_hood158.csv", desc: "140 → 158 children with area shares" },
      { name: "ward25_to_hood158.csv", desc: "Every 158 neighbourhood's ward, verified" },
      { name: "neighbourhoods_158_simple.geojson", desc: "Simplified boundaries for web maps" },
    ],
    download: "Download",
  },
  footer: {
    line: "An open-source civic project by Nshipyard. Not affiliated with the Government of Canada or the City of Toronto.",
    sources: "Boundary sources: City of Toronto Open Data (Neighbourhoods, City Wards). Overlaps computed from official geometries.",
  },
};

export type Dict = typeof en;

const fr: Dict = {
  banner: {
    line: "Un projet civique à code source ouvert par Nshipyard. Sans affiliation avec le gouvernement du Canada ni la Ville de Toronto.",
    badge: "Code source ouvert",
  },
  nav: { explorer: "Explorateur", splits: "Les divisions", developers: "Développeurs", data: "Données", back: "Tous les projets" },
  hero: {
    kicker: "Nshipyard Canada · Projet 01",
    title: "Toutes les limites de quartier, reliées entre les recensements.",
    sub: "Les quartiers de Toronto sont passés de 140 à 158 lors du recensement de 2021. Voici la table de correspondance canonique : quels anciens quartiers sont devenus lesquels, par chevauchement exact des superficies, plus les concordances d'arrondissements.",
    cta1: "Explorer la carte",
    cta2: "Lire la méthodologie",
  },
  stats: [
    { value: "158", label: "quartiers du modèle actuel, chacun relié à son parent du modèle 140" },
    { value: "16 → 34", label: "anciens quartiers divisés en nouveaux, avec parts exactes de superficie" },
    { value: "124", label: "quartiers inchangés, vérifiés par chevauchement total" },
    { value: "25", label: "arrondissements reliés : chaque quartier est dans exactement un arrondissement" },
  ],
  explorer: {
    kicker: "Explorateur",
    title: "Trouvez n'importe quel quartier, dans l'un ou l'autre modèle.",
    search: "Rechercher par nom ou code…",
    colorBy: "Colorer par",
    by158: "modèle 158",
    by140: "parent 140",
    byWard: "arrondissement",
    detail: {
      code158: "Quartier 158",
      parent140: "Parent dans le modèle 140",
      ward: "Arrondissement",
      ofArea: "de sa superficie",
      siblings: "Divisé avec",
      unchanged: "Inchangé lors du redécoupage",
      shareNote: "Part de la superficie du parent",
    },
    noResult: "Aucun quartier ne correspond.",
    empty: "Cliquez sur un quartier de la carte, ou recherchez par nom ou code ci-dessus, pour voir son parent du modèle 140, son arrondissement et son historique de division.",
  },
  splits: {
    kicker: "Vitrine",
    title: "Les 16 quartiers devenus 34.",
    body: "Les zones à forte croissance ont été divisées pour le recensement de 2021. Avant cette table, comparer une série de 2016 à 2021 exigeait de la dériver à la main. Maintenant, elle se télécharge.",
    parent: "modèle 140",
    children: "modèle 158",
    download: "Télécharger la table (CSV)",
  },
  developers: {
    kicker: "Pour les développeurs",
    title: "Interrogez-la depuis du code, ou depuis un agent.",
    body: "Trois façons de consommer les mêmes données canoniques. REST pour les applications, OpenAPI pour l'intégration, outils MCP en HTTP continu pour les agents IA.",
    endpoints: "Points de terminaison",
    tryIt: "Essayer",
    openapi: "Spécification OpenAPI",
    mcpTitle: "Serveur MCP",
    mcpBody: "Un point de terminaison HTTP continu. Outils : geo_convert, geo_lookup, geo_splits.",
  },
  downloads: {
    kicker: "Données",
    title: "Prenez les fichiers.",
    body: "Versions numérotées, licence MIT. CSV pour les tableurs, GeoJSON pour les cartes.",
    files: [
      { name: "hood158_to_hood140.csv", desc: "158 → 140 avec parts de superficie et indicateur principal" },
      { name: "hood140_to_hood158.csv", desc: "140 → enfants 158 avec parts de superficie" },
      { name: "ward25_to_hood158.csv", desc: "L'arrondissement de chaque quartier 158, vérifié" },
      { name: "neighbourhoods_158_simple.geojson", desc: "Limites simplifiées pour les cartes web" },
    ],
    download: "Télécharger",
  },
  footer: {
    line: "Un projet civique à code source ouvert par Nshipyard. Sans affiliation avec le gouvernement du Canada ni la Ville de Toronto.",
    sources: "Sources des limites : Données ouvertes de la Ville de Toronto (quartiers, arrondissements). Chevauchements calculés à partir des géométries officielles.",
  },
};

const dicts: Record<Lang, Dict> = { en, fr };

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang, t: dicts[lang] }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}
