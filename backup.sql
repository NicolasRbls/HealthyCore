--
-- PostgreSQL database dump
--

\restrict 730vMHeCszt64sfX6MgfXqgsk2thIaRuT4A2T1YZezMgdY6qWb1pD6lqH47ZBzQ

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg13+2)
-- Dumped by pg_dump version 18.1 (Debian 18.1-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO admin;

--
-- Name: activites; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.activites (
    id_activite integer NOT NULL,
    nom character varying(50) NOT NULL,
    description text NOT NULL
);


ALTER TABLE public.activites OWNER TO admin;

--
-- Name: activites_id_activite_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.activites_id_activite_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activites_id_activite_seq OWNER TO admin;

--
-- Name: activites_id_activite_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.activites_id_activite_seq OWNED BY public.activites.id_activite;


--
-- Name: aliments; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.aliments (
    id_aliment integer NOT NULL,
    image character varying(255),
    source character varying(20) NOT NULL,
    type character varying(20) NOT NULL,
    id_user integer,
    nom character varying(100) NOT NULL,
    ingredients text,
    description text,
    calories integer NOT NULL,
    proteines numeric NOT NULL,
    glucides numeric NOT NULL,
    lipides numeric NOT NULL,
    code_barres character varying(255),
    temps_preparation integer NOT NULL
);


ALTER TABLE public.aliments OWNER TO admin;

--
-- Name: aliments_id_aliment_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.aliments_id_aliment_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aliments_id_aliment_seq OWNER TO admin;

--
-- Name: aliments_id_aliment_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.aliments_id_aliment_seq OWNED BY public.aliments.id_aliment;


--
-- Name: aliments_tags; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.aliments_tags (
    id_aliment integer NOT NULL,
    id_tag integer NOT NULL
);


ALTER TABLE public.aliments_tags OWNER TO admin;

--
-- Name: badges; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.badges (
    id_badge integer NOT NULL,
    nom character varying(100) NOT NULL,
    image character varying(255) NOT NULL,
    description text NOT NULL,
    condition_obtention text NOT NULL
);


ALTER TABLE public.badges OWNER TO admin;

--
-- Name: badges_id_badge_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.badges_id_badge_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.badges_id_badge_seq OWNER TO admin;

--
-- Name: badges_id_badge_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.badges_id_badge_seq OWNED BY public.badges.id_badge;


--
-- Name: badges_utilisateurs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.badges_utilisateurs (
    id_badge_utilisateur integer NOT NULL,
    id_user integer NOT NULL,
    id_badge integer NOT NULL,
    date_obtention timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.badges_utilisateurs OWNER TO admin;

--
-- Name: badges_utilisateurs_id_badge_utilisateur_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.badges_utilisateurs_id_badge_utilisateur_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.badges_utilisateurs_id_badge_utilisateur_seq OWNER TO admin;

--
-- Name: badges_utilisateurs_id_badge_utilisateur_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.badges_utilisateurs_id_badge_utilisateur_seq OWNED BY public.badges_utilisateurs.id_badge_utilisateur;


--
-- Name: evaluations_recettes; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.evaluations_recettes (
    id_evaluation_recette integer NOT NULL,
    id_aliment integer NOT NULL,
    id_user integer NOT NULL,
    evaluation character varying(10) NOT NULL
);


ALTER TABLE public.evaluations_recettes OWNER TO admin;

--
-- Name: evaluations_recettes_id_evaluation_recette_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.evaluations_recettes_id_evaluation_recette_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.evaluations_recettes_id_evaluation_recette_seq OWNER TO admin;

--
-- Name: evaluations_recettes_id_evaluation_recette_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.evaluations_recettes_id_evaluation_recette_seq OWNED BY public.evaluations_recettes.id_evaluation_recette;


--
-- Name: evolutions; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.evolutions (
    id_evolution integer NOT NULL,
    id_user integer NOT NULL,
    date date NOT NULL,
    poids numeric NOT NULL,
    taille numeric NOT NULL
);


ALTER TABLE public.evolutions OWNER TO admin;

--
-- Name: evolutions_id_evolution_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.evolutions_id_evolution_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.evolutions_id_evolution_seq OWNER TO admin;

--
-- Name: evolutions_id_evolution_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.evolutions_id_evolution_seq OWNED BY public.evolutions.id_evolution;


--
-- Name: exercices; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.exercices (
    id_exercice integer NOT NULL,
    nom character varying(100) NOT NULL,
    gif character varying(255),
    description text NOT NULL,
    equipement character varying(255)
);


ALTER TABLE public.exercices OWNER TO admin;

--
-- Name: exercices_id_exercice_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.exercices_id_exercice_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercices_id_exercice_seq OWNER TO admin;

--
-- Name: exercices_id_exercice_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.exercices_id_exercice_seq OWNED BY public.exercices.id_exercice;


--
-- Name: exercices_seances; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.exercices_seances (
    id_exercice_seance integer NOT NULL,
    id_exercice integer NOT NULL,
    id_seance integer NOT NULL,
    ordre_exercice integer NOT NULL,
    repetitions integer,
    series integer,
    duree integer NOT NULL
);


ALTER TABLE public.exercices_seances OWNER TO admin;

--
-- Name: exercices_seances_id_exercice_seance_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.exercices_seances_id_exercice_seance_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercices_seances_id_exercice_seance_seq OWNER TO admin;

--
-- Name: exercices_seances_id_exercice_seance_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.exercices_seances_id_exercice_seance_seq OWNED BY public.exercices_seances.id_exercice_seance;


--
-- Name: exercices_tags; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.exercices_tags (
    id_exercice integer NOT NULL,
    id_tag integer NOT NULL
);


ALTER TABLE public.exercices_tags OWNER TO admin;

--
-- Name: niveaux_sedentarites; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.niveaux_sedentarites (
    id_niveau_sedentarite integer NOT NULL,
    nom character varying(50) NOT NULL,
    description text,
    valeur numeric NOT NULL
);


ALTER TABLE public.niveaux_sedentarites OWNER TO admin;

--
-- Name: niveaux_sedentarites_id_niveau_sedentarite_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.niveaux_sedentarites_id_niveau_sedentarite_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.niveaux_sedentarites_id_niveau_sedentarite_seq OWNER TO admin;

--
-- Name: niveaux_sedentarites_id_niveau_sedentarite_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.niveaux_sedentarites_id_niveau_sedentarite_seq OWNED BY public.niveaux_sedentarites.id_niveau_sedentarite;


--
-- Name: objectifs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.objectifs (
    id_objectif integer NOT NULL,
    titre character varying(100) NOT NULL
);


ALTER TABLE public.objectifs OWNER TO admin;

--
-- Name: objectifs_id_objectif_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.objectifs_id_objectif_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.objectifs_id_objectif_seq OWNER TO admin;

--
-- Name: objectifs_id_objectif_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.objectifs_id_objectif_seq OWNED BY public.objectifs.id_objectif;


--
-- Name: objectifs_utilisateurs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.objectifs_utilisateurs (
    id_objectif_utilisateur integer NOT NULL,
    id_user integer NOT NULL,
    id_objectif integer NOT NULL,
    date date NOT NULL,
    statut character varying(10) DEFAULT 'not_done'::character varying NOT NULL
);


ALTER TABLE public.objectifs_utilisateurs OWNER TO admin;

--
-- Name: objectifs_utilisateurs_id_objectif_utilisateur_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.objectifs_utilisateurs_id_objectif_utilisateur_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.objectifs_utilisateurs_id_objectif_utilisateur_seq OWNER TO admin;

--
-- Name: objectifs_utilisateurs_id_objectif_utilisateur_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.objectifs_utilisateurs_id_objectif_utilisateur_seq OWNED BY public.objectifs_utilisateurs.id_objectif_utilisateur;


--
-- Name: preferences; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.preferences (
    id_preference integer NOT NULL,
    id_user integer NOT NULL,
    objectif_poids numeric NOT NULL,
    id_repartition_nutritionnelle integer NOT NULL,
    id_regime_alimentaire integer NOT NULL,
    id_niveau_sedentarite integer NOT NULL,
    seances_par_semaines integer NOT NULL,
    bmr numeric NOT NULL,
    tdee numeric NOT NULL,
    calories_quotidiennes numeric NOT NULL,
    duree_objectif_semaines integer,
    deficit_surplus_calorique numeric
);


ALTER TABLE public.preferences OWNER TO admin;

--
-- Name: preferences_activites; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.preferences_activites (
    id_preference integer NOT NULL,
    id_activite integer NOT NULL
);


ALTER TABLE public.preferences_activites OWNER TO admin;

--
-- Name: preferences_id_preference_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.preferences_id_preference_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.preferences_id_preference_seq OWNER TO admin;

--
-- Name: preferences_id_preference_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.preferences_id_preference_seq OWNED BY public.preferences.id_preference;


--
-- Name: programmes; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.programmes (
    id_programme integer NOT NULL,
    id_user integer NOT NULL,
    nom character varying(100) NOT NULL,
    image character varying(255),
    duree integer NOT NULL
);


ALTER TABLE public.programmes OWNER TO admin;

--
-- Name: programmes_id_programme_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.programmes_id_programme_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.programmes_id_programme_seq OWNER TO admin;

--
-- Name: programmes_id_programme_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.programmes_id_programme_seq OWNED BY public.programmes.id_programme;


--
-- Name: programmes_tags; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.programmes_tags (
    id_programme integer NOT NULL,
    id_tag integer NOT NULL
);


ALTER TABLE public.programmes_tags OWNER TO admin;

--
-- Name: programmes_utilisateurs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.programmes_utilisateurs (
    id_programme_utilisateur integer NOT NULL,
    id_programme integer NOT NULL,
    id_user integer NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL
);


ALTER TABLE public.programmes_utilisateurs OWNER TO admin;

--
-- Name: programmes_utilisateurs_id_programme_utilisateur_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.programmes_utilisateurs_id_programme_utilisateur_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.programmes_utilisateurs_id_programme_utilisateur_seq OWNER TO admin;

--
-- Name: programmes_utilisateurs_id_programme_utilisateur_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.programmes_utilisateurs_id_programme_utilisateur_seq OWNED BY public.programmes_utilisateurs.id_programme_utilisateur;


--
-- Name: recettes_du_jour; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.recettes_du_jour (
    id_recette_du_jour integer NOT NULL,
    date date NOT NULL,
    id_aliment integer NOT NULL
);


ALTER TABLE public.recettes_du_jour OWNER TO admin;

--
-- Name: recettes_du_jour_id_recette_du_jour_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.recettes_du_jour_id_recette_du_jour_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recettes_du_jour_id_recette_du_jour_seq OWNER TO admin;

--
-- Name: recettes_du_jour_id_recette_du_jour_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.recettes_du_jour_id_recette_du_jour_seq OWNED BY public.recettes_du_jour.id_recette_du_jour;


--
-- Name: regimes_alimentaires; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.regimes_alimentaires (
    id_regime_alimentaire integer NOT NULL,
    nom character varying(50) NOT NULL,
    description text NOT NULL
);


ALTER TABLE public.regimes_alimentaires OWNER TO admin;

--
-- Name: regimes_alimentaires_id_regime_alimentaire_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.regimes_alimentaires_id_regime_alimentaire_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.regimes_alimentaires_id_regime_alimentaire_seq OWNER TO admin;

--
-- Name: regimes_alimentaires_id_regime_alimentaire_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.regimes_alimentaires_id_regime_alimentaire_seq OWNED BY public.regimes_alimentaires.id_regime_alimentaire;


--
-- Name: repartitions_nutritionnelles; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.repartitions_nutritionnelles (
    id_repartition_nutritionnelle integer CONSTRAINT repartitions_nutritionnelle_id_repartition_nutritionne_not_null NOT NULL,
    nom character varying(100) NOT NULL,
    description text NOT NULL,
    type character varying(20) NOT NULL,
    pourcentage_glucides numeric NOT NULL,
    pourcentage_proteines numeric NOT NULL,
    pourcentage_lipides numeric NOT NULL
);


ALTER TABLE public.repartitions_nutritionnelles OWNER TO admin;

--
-- Name: repartitions_nutritionnelles_id_repartition_nutritionnelle_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.repartitions_nutritionnelles_id_repartition_nutritionnelle_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.repartitions_nutritionnelles_id_repartition_nutritionnelle_seq OWNER TO admin;

--
-- Name: repartitions_nutritionnelles_id_repartition_nutritionnelle_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.repartitions_nutritionnelles_id_repartition_nutritionnelle_seq OWNED BY public.repartitions_nutritionnelles.id_repartition_nutritionnelle;


--
-- Name: seances; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.seances (
    id_seance integer NOT NULL,
    nom character varying(100) NOT NULL,
    id_user integer NOT NULL
);


ALTER TABLE public.seances OWNER TO admin;

--
-- Name: seances_id_seance_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.seances_id_seance_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.seances_id_seance_seq OWNER TO admin;

--
-- Name: seances_id_seance_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.seances_id_seance_seq OWNED BY public.seances.id_seance;


--
-- Name: seances_programmes; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.seances_programmes (
    id_seance_programme integer NOT NULL,
    id_seance integer NOT NULL,
    id_programme integer NOT NULL,
    ordre_seance integer NOT NULL
);


ALTER TABLE public.seances_programmes OWNER TO admin;

--
-- Name: seances_programmes_id_seance_programme_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.seances_programmes_id_seance_programme_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.seances_programmes_id_seance_programme_seq OWNER TO admin;

--
-- Name: seances_programmes_id_seance_programme_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.seances_programmes_id_seance_programme_seq OWNED BY public.seances_programmes.id_seance_programme;


--
-- Name: seances_tags; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.seances_tags (
    id_seance integer NOT NULL,
    id_tag integer NOT NULL
);


ALTER TABLE public.seances_tags OWNER TO admin;

--
-- Name: signalements; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.signalements (
    id_signalement integer NOT NULL,
    titre character varying(100) NOT NULL
);


ALTER TABLE public.signalements OWNER TO admin;

--
-- Name: signalements_id_signalement_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.signalements_id_signalement_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.signalements_id_signalement_seq OWNER TO admin;

--
-- Name: signalements_id_signalement_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.signalements_id_signalement_seq OWNED BY public.signalements.id_signalement;


--
-- Name: signalements_utilisateurs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.signalements_utilisateurs (
    id_signalement_utilisateur integer NOT NULL,
    id_user integer NOT NULL,
    id_signalement integer NOT NULL,
    id_aliment integer NOT NULL,
    description text,
    date timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    statut character varying(20) DEFAULT 'non_revue'::character varying NOT NULL
);


ALTER TABLE public.signalements_utilisateurs OWNER TO admin;

--
-- Name: signalements_utilisateurs_id_signalement_utilisateur_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.signalements_utilisateurs_id_signalement_utilisateur_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.signalements_utilisateurs_id_signalement_utilisateur_seq OWNER TO admin;

--
-- Name: signalements_utilisateurs_id_signalement_utilisateur_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.signalements_utilisateurs_id_signalement_utilisateur_seq OWNED BY public.signalements_utilisateurs.id_signalement_utilisateur;


--
-- Name: suivis_nutritionnels; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.suivis_nutritionnels (
    id_suivi_nutritionnel integer NOT NULL,
    id_user integer NOT NULL,
    id_aliment integer NOT NULL,
    date date NOT NULL,
    repas character varying(20) NOT NULL,
    quantite integer NOT NULL
);


ALTER TABLE public.suivis_nutritionnels OWNER TO admin;

--
-- Name: suivis_nutritionnels_id_suivi_nutritionnel_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.suivis_nutritionnels_id_suivi_nutritionnel_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suivis_nutritionnels_id_suivi_nutritionnel_seq OWNER TO admin;

--
-- Name: suivis_nutritionnels_id_suivi_nutritionnel_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.suivis_nutritionnels_id_suivi_nutritionnel_seq OWNED BY public.suivis_nutritionnels.id_suivi_nutritionnel;


--
-- Name: suivis_sportifs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.suivis_sportifs (
    id_suivi_sportif integer NOT NULL,
    id_user integer NOT NULL,
    id_seance integer NOT NULL,
    date date NOT NULL
);


ALTER TABLE public.suivis_sportifs OWNER TO admin;

--
-- Name: suivis_sportifs_id_suivi_sportif_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.suivis_sportifs_id_suivi_sportif_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suivis_sportifs_id_suivi_sportif_seq OWNER TO admin;

--
-- Name: suivis_sportifs_id_suivi_sportif_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.suivis_sportifs_id_suivi_sportif_seq OWNED BY public.suivis_sportifs.id_suivi_sportif;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.tags (
    id_tag integer NOT NULL,
    nom character varying(50) NOT NULL,
    type character varying(20) NOT NULL
);


ALTER TABLE public.tags OWNER TO admin;

--
-- Name: tags_id_tag_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.tags_id_tag_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_tag_seq OWNER TO admin;

--
-- Name: tags_id_tag_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.tags_id_tag_seq OWNED BY public.tags.id_tag;


--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id_user integer NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    prenom character varying(50) NOT NULL,
    nom character varying(50) NOT NULL,
    sexe character varying(2) DEFAULT 'NS'::character varying NOT NULL,
    date_de_naissance date NOT NULL,
    email character varying(100) NOT NULL,
    mot_de_passe character varying(255) NOT NULL,
    cree_a timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mis_a_jour_a timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: users_id_user_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.users_id_user_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_user_seq OWNER TO admin;

--
-- Name: users_id_user_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.users_id_user_seq OWNED BY public.users.id_user;


--
-- Name: activites id_activite; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.activites ALTER COLUMN id_activite SET DEFAULT nextval('public.activites_id_activite_seq'::regclass);


--
-- Name: aliments id_aliment; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.aliments ALTER COLUMN id_aliment SET DEFAULT nextval('public.aliments_id_aliment_seq'::regclass);


--
-- Name: badges id_badge; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.badges ALTER COLUMN id_badge SET DEFAULT nextval('public.badges_id_badge_seq'::regclass);


--
-- Name: badges_utilisateurs id_badge_utilisateur; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.badges_utilisateurs ALTER COLUMN id_badge_utilisateur SET DEFAULT nextval('public.badges_utilisateurs_id_badge_utilisateur_seq'::regclass);


--
-- Name: evaluations_recettes id_evaluation_recette; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluations_recettes ALTER COLUMN id_evaluation_recette SET DEFAULT nextval('public.evaluations_recettes_id_evaluation_recette_seq'::regclass);


--
-- Name: evolutions id_evolution; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evolutions ALTER COLUMN id_evolution SET DEFAULT nextval('public.evolutions_id_evolution_seq'::regclass);


--
-- Name: exercices id_exercice; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exercices ALTER COLUMN id_exercice SET DEFAULT nextval('public.exercices_id_exercice_seq'::regclass);


--
-- Name: exercices_seances id_exercice_seance; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exercices_seances ALTER COLUMN id_exercice_seance SET DEFAULT nextval('public.exercices_seances_id_exercice_seance_seq'::regclass);


--
-- Name: niveaux_sedentarites id_niveau_sedentarite; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.niveaux_sedentarites ALTER COLUMN id_niveau_sedentarite SET DEFAULT nextval('public.niveaux_sedentarites_id_niveau_sedentarite_seq'::regclass);


--
-- Name: objectifs id_objectif; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.objectifs ALTER COLUMN id_objectif SET DEFAULT nextval('public.objectifs_id_objectif_seq'::regclass);


--
-- Name: objectifs_utilisateurs id_objectif_utilisateur; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.objectifs_utilisateurs ALTER COLUMN id_objectif_utilisateur SET DEFAULT nextval('public.objectifs_utilisateurs_id_objectif_utilisateur_seq'::regclass);


--
-- Name: preferences id_preference; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.preferences ALTER COLUMN id_preference SET DEFAULT nextval('public.preferences_id_preference_seq'::regclass);


--
-- Name: programmes id_programme; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.programmes ALTER COLUMN id_programme SET DEFAULT nextval('public.programmes_id_programme_seq'::regclass);


--
-- Name: programmes_utilisateurs id_programme_utilisateur; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.programmes_utilisateurs ALTER COLUMN id_programme_utilisateur SET DEFAULT nextval('public.programmes_utilisateurs_id_programme_utilisateur_seq'::regclass);


--
-- Name: recettes_du_jour id_recette_du_jour; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.recettes_du_jour ALTER COLUMN id_recette_du_jour SET DEFAULT nextval('public.recettes_du_jour_id_recette_du_jour_seq'::regclass);


--
-- Name: regimes_alimentaires id_regime_alimentaire; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.regimes_alimentaires ALTER COLUMN id_regime_alimentaire SET DEFAULT nextval('public.regimes_alimentaires_id_regime_alimentaire_seq'::regclass);


--
-- Name: repartitions_nutritionnelles id_repartition_nutritionnelle; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.repartitions_nutritionnelles ALTER COLUMN id_repartition_nutritionnelle SET DEFAULT nextval('public.repartitions_nutritionnelles_id_repartition_nutritionnelle_seq'::regclass);


--
-- Name: seances id_seance; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.seances ALTER COLUMN id_seance SET DEFAULT nextval('public.seances_id_seance_seq'::regclass);


--
-- Name: seances_programmes id_seance_programme; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.seances_programmes ALTER COLUMN id_seance_programme SET DEFAULT nextval('public.seances_programmes_id_seance_programme_seq'::regclass);


--
-- Name: signalements id_signalement; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.signalements ALTER COLUMN id_signalement SET DEFAULT nextval('public.signalements_id_signalement_seq'::regclass);


--
-- Name: signalements_utilisateurs id_signalement_utilisateur; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.signalements_utilisateurs ALTER COLUMN id_signalement_utilisateur SET DEFAULT nextval('public.signalements_utilisateurs_id_signalement_utilisateur_seq'::regclass);


--
-- Name: suivis_nutritionnels id_suivi_nutritionnel; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.suivis_nutritionnels ALTER COLUMN id_suivi_nutritionnel SET DEFAULT nextval('public.suivis_nutritionnels_id_suivi_nutritionnel_seq'::regclass);


--
-- Name: suivis_sportifs id_suivi_sportif; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.suivis_sportifs ALTER COLUMN id_suivi_sportif SET DEFAULT nextval('public.suivis_sportifs_id_suivi_sportif_seq'::regclass);


--
-- Name: tags id_tag; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tags ALTER COLUMN id_tag SET DEFAULT nextval('public.tags_id_tag_seq'::regclass);


--
-- Name: users id_user; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users ALTER COLUMN id_user SET DEFAULT nextval('public.users_id_user_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
d3f0783a-fcc9-4f01-bb4b-05203b5ea06e	5a93da619a7fedf5ff503bc80c48bc60720ebed166628c82759c680e1c320db7	2025-11-18 15:19:16.393799+00	20250224094510_init	\N	\N	2025-11-18 15:19:16.361303+00	1
\.


--
-- Data for Name: activites; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.activites (id_activite, nom, description) FROM stdin;
1	Cardio modéré	Maintien et bien-être
2	HIIT	Performance maximale.
3	Running	Endurance et cardio
4	Musculation	Développement musculaire
5	Yoga/Pilates	Équilibre et détente
\.


--
-- Data for Name: aliments; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.aliments (id_aliment, image, source, type, id_user, nom, ingredients, description, calories, proteines, glucides, lipides, code_barres, temps_preparation) FROM stdin;
1	/assets/images/aliments/1-nutella-1kg.png	admin	produit	1	Nutella - Ferrero - 1 kg	Sucre|Huile de palme|Noisettes 13%|Lait écrémé en poudre 8,7%|Cacao maigre 7,4%|Émulsifiants : lécithines [soja]|Vanilline. Sans gluten	\N	539	6.3	57.5	31	3017620425035	1
2	/assets/images/aliments/2-prince-100g.png	admin	produit	1	Prince Goût Chocolat - LuMondelez - 100g	Céréale 50,7%(Farine de blé 35%,Farine de blé complète 15,7%)|Sucre|Huiles végétales(Palme,Colza)|Cacao maigre en poudre 4,5%|Sirop de glucose|Amidon de blé|Poudre à lever(Carbonate acide d'ammonium,Carbonate acide de sodium,Diphosphate disodique)|Émulsifiants(Lécithine de soja,Lécithine de tournesol)|Sel|Lait écrémé en poudre|Lactose et protéines de lait|Arômes. Peut contenir œuf.	\N	467	6.3	69	17	7622210449283	1
3	/assets/images/aliments/3-fruits-secs-alesto-200g.png	admin	produit	1	Mélange de fruits secs - Alesto - 200 g	25% noix|25% noisettes|25% noix de cajou|25% amandes blanchies	\N	646	20.4	6.4	58	20047238	1
4	/assets/images/aliments/4-pat-noisettes-bonne-maman-360g.png	admin	produit	1	Pâte à tartiner noisettes et cacao - Bonne Maman - 360 g	Sucre|Noisettes 20%|Huiles végétales(Tournesol,Colza)|Lait écrémé en poudre|Cacao maigre en poudre 5,5%|Beurre de cacao|Émulsifiant : lécithine de tournesol|Extrait de vanille|Peut contenir d'autres fruits à coque	\N	551	6.7	53	34	3608580065340	1
5	/assets/images/aliments/5-tuc-100g.png	admin	produit	1	Original - Tuc - 100 g	Farine de blé|Huile de palme|Sirop de glucose|Extrait de malt d'orge|Poudres à lever (Carbonates d'ammonium, Carbonates de sodium)|Sel|Œufs|Arôme|Agent de traitement de la farine (Disulfite de sodium)	\N	482	8.300000000000001	67	19	5410041001204	1
6	/assets/images/aliments/6-salade-verte-avocat.png	admin	recette	1	Salade verte à l'avocat	1/6 cuillère à soupe de jus de citron|Une pincée de sel|2/3 cuillère à soupe d'huile d'olive|1/6 petit bouquet de ciboulette finement hachée|33 g de feuilles de salade mélangées|1/3 avocat mûr tranché	Pressez 1/6 cuillère à soupe de jus de citron dans un pot à confiture avec une pincée de sel|Versez 2/3 cuillère à soupe d'huile d'olive|Ajoutez 1/6 petit bouquet de ciboulette finement ciselée|Fermez le couvercle et secouez bien|Pour servir, mélangez avec 33 g de salade composée et 1/3 avocat mûr coupé en tranches.	193	1.8	7	19	\N	10
7	/assets/images/aliments/7-pates-tomates-mozza.png	admin	recette	1	Pâtes aux tomates et à la mozzarella	75g penne|83g tomates cerises coupées en 2|20ml de pesto|37g mozzarella fraîche coupée en morceaux|10ml d'huile d'olive|Sel poivre|2,5g de basilic frais déchiré|3,3g de parmesan râpé	Préchauffer le four à 180°C (th.4)|Beurrer un plat à gratin peu profond de 2,5 à 3 litres|Cuire les penne dans de l'eau bouillante salée|Pendant ce temps, chauffer l'huile d'olive dans une casserole à feu moyen|Ajouter l'oignon et cuire environ 4 minutes jusqu'à ce qu'il devienne translucide|Ajouter l'ail et poursuivre la cuisson 1 minute|Ajouter les tomates, le basilic et l'origan à l'oignon et à l'ail|Cuire en remuant fréquemment jusqu'à ce que le mélange soit bien chaud|Goûter et assaisonner avec du sel et du poivre|Dans un grand saladier, mélanger les penne cuites et égouttées avec la sauce tomate et 16,7g de mozzarella râpée|Remuer pour bien mélanger les ingrédients|Verser le mélange de pâtes et de sauce dans le plat préparé|Saupoudrer avec les 16,7g restants de mozzarella râpée|Enfourner pendant 20 à 25 minutes, jusqu'à ce que les pâtes soient bien chaudes et que le fromage soit fondu et légèrement doré	585	22	62	27	\N	40
8	/assets/images/aliments/8-perfect-white-rice.png	admin	recette	1	Riz blanc	1 tasse de riz blanc à longs grains|1/2 cuillère à café de sel	Porter 375ml d'eau à ébullition dans une casserole moyenne|Incorporer le riz et le sel, puis porter de nouveau à ébullition à feu moyen-vif|Réduire à feu doux, couvrir et laisser cuire environ 16 minutes|Retirer du feu et laisser reposer à couvert pendant 10 minutes	176	3	39	0	\N	20
9	https://images.openfoodfacts.org/images/products/348/034/100/0674/front_en.123.400.jpg	api	produit	\N	Carré Frais - Elle & Vire - 200 g	skimmed milk (origin: france), salt, lactic ferments.		85	16.0	4.5	0.3	3480341000674	0
10	https://images.openfoodfacts.org/images/products/317/568/001/5228/front_fr.294.400.jpg	api	produit	\N	Levure de bière - Gerblé - 150 g	Levure de bière 93%, extrait de malt d'orge 7%	Levure de bière au malt d'orge	323	46.0	12.0	4.6	3175680015228	0
11	https://images.openfoodfacts.org/images/products/348/034/100/0636/front_en.150.400.jpg	api	produit	\N	Carré Frais - Nature - Elle&Vire - 200g 8x25g	Lait écrémé et crème (origine : France), sel, ferments lactiques.	Fromage frais demi-sel au lait pasteurisé	193	12.0	2.5	15.0	3480341000636	0
12	https://images.openfoodfacts.org/images/products/327/277/009/7642/front_fr.96.400.jpg	api	produit	\N	Le Goût Primeur format familial - Savencia, St Moret - 300 g e	Lait et crème pasteurisés (Origine : France), protéines du lait, sel,	Spécialité fromagère pasteurisée	205	8.3	3.0	17.8	3272770097642	0
13	https://images.openfoodfacts.org/images/products/316/171/100/1971/front_en.120.400.jpg	api	produit	\N	Caprice des dieux - caprice des dieux - 300g	pasteurized cow's milk and cream from france, salt, lactic ferments (milk)		333	15.0	0.8	30.0	3161711001971	0
14	https://images.openfoodfacts.org/images/products/761/303/602/1388/front_fr.137.400.jpg	api	produit	\N	La Panée Soja et Blé - Garden Gourmet - 180 g	Protéines de SOJA réhydratées 34,6% (eau, protéines de SOJA concentrées 14,4%), eau, chapelure 16,9% (farine de BLÉ , levure, sel, huile de colza, extrait de paprika, épices (paprika, curcuma), huiles végétales en proportion variable (colza, tournesol), farine de BLÉ, amidon de maïs, vinaigre d'alcool, stabilisants (méthylcellulose, gomme de guar), fibres d'agrumes, arômes naturels, sel, oignon en poudre, correcteur d'acidité : hydroxyde de potassium ; ail en poudre. Peut contenir : SESAME, MOUTARDE, CELERI, OEUFS .	Spécialité végane à base de protéines de soja, décongelée.	235	12.3	17.6	11.7	7613036021388	0
15	https://images.openfoodfacts.org/images/products/303/349/158/8136/front_fr.110.400.jpg	api	produit	\N	HIPRO Saveur Vanille - Hipro, Danone - 320g (2x160g)	LAIT écrémé, eau, épaississant (amidon modifié), magnésium, correcteur d'acidité (acide citrique), concentré de carotte, arôme naturel de vanille, arômes naturels, gousses de vanille épuisées, édulcorants (acésulfame-K, sucralose), ferments lactiques (LAIT), mine 89. Décor : écorce de vanille.	Spécialité laitière à la vanille, avec édulcorants	53	9.4	3.6	0.1	3033491588136	0
16	https://images.openfoodfacts.org/images/products/761/303/593/7420/front_en.273.400.jpg	api	produit	\N	HERTA Knacki Veggie Saucisses végétales x6 -210g - Herta - 210 g	Eau, huile de colza, GLUTEN de BLE (12,9%), blanc d'OEUF en poudre (4,2%), arômes naturels, Conservateurs : lactate de potassium, acétate de potassium; gélifiants : méthylcellulose, farine de graines de caroube; sel, vinaigre d'alcool, isolat de protéines de pois (0,9%), épices, épaississant: gomme xanthane, stabilisant : gomme guar, tomate en poudre, amidon de BLÉ, antioxydant : ascorbate de sodium, panais, extrait d'épices, poireau, colorant : lycopène. Peut contenir : SOJA, LAIT.	Spécialité végétarienne fumée à base de protéines de blé 9,6%, de blanc d'œuf 4,2% et de protéines de pois 0,8%	264	16.0	4.0	20.0	7613035937420	0
17	https://images.openfoodfacts.org/images/products/303/349/170/4642/front_en.84.400.jpg	api	produit	\N	Skyr nature 0% - Danone - 825 g	Lait écrémé, ferments lactiques (lait).		57	10.0	3.9	0.2	3033491704642	0
18	https://images.openfoodfacts.org/images/products/841/007/661/0744/front_fr.51.400.jpg	api	produit	\N	Protein Caramel salé Cacahuètes - Nature Valley - 160 g ℮, 4 barres de 40 g	_cacahuètes_ grillées (38%), extrait de racine de chicorée, protéine isolée de _soja_, _amandes_ 9%, sirop de glucose, matière grasse végétale: palme; lactosérum (_lait_), fructose, maltodextrine, huile de tournesol, amidon de tapioca, humectant: glycérol; sel, caramel en poudre (sucre, _lait_ écrémé en poudre), _lait_ écrémé en poudre, émulsifiants: lécithines de tournesol et de _soja_; arômes naturels	Barre aux cacahuètes et aux amandes sur un enrobage saveur caramel	495	26.0	26.0	29.5	8410076610744	0
19	https://images.openfoodfacts.org/images/products/332/977/005/1072/front_fr.142.400.jpg	api	produit	\N	petit yoplait - Petit yoplait std, Yoplait - 360 g	LAIT écrémé et CREME pasteurisés - Poudre de LAIT écrémé - Ferments LACTIQUES - Papier traité au sorbate de potassium,\r\nLAIT D'ORIGINE FRANCE	Fromage frais nature au lait demi-écrémé.	87	9.0	4.1	3.8	3329770051072	0
20	https://images.openfoodfacts.org/images/products/377/001/616/2043/front_fr.69.400.jpg	api	produit	\N	Merguez Végétal - HAPPYVORE - 200 g	Eau, huile de colza, protéines de pois texturées (protéines de pois (9%), extrait de pois), enveloppe végétale (gélifiant: alginate de calcium), fibres (bambou, agrumes), stabilisant: méthylcellulose, correcteur d'acidité: vinaigre tamponné, épices, isolat de protéines de pois (1.5%), paprika, cumin, farine de riz, extrait de betterave rouge, amidon de pomme de terre, arômes naturels, sel fumé (sel, fumé).		220	12.0	4.8	16.0	3770016162043	0
21	https://images.openfoodfacts.org/images/products/325/221/039/0014/front_en.200.400.jpg	api	produit	\N	Produit sans nom - Lactel - 1 l	semi-skimmed milk, vitamin d		46	3.3	4.8	1.5	3252210390014	0
22	https://images.openfoodfacts.org/images/products/376/032/430/0015/front_fr.64.400.jpg	api	produit	\N	2 Steaks végétaux et gourmands - Happyvore - 200 g	rehydrated textured pea protein (water, pea protein (9,5%), pea extract), water, sunflower oil, faba bean protein (2,5%), pea protein (2%), potato starch, plant fiber (bamboo, plantain, potato), natural flavors, salt, beet juice concentrate, barley malt extract, maltodextrin, acidity regulators: buffered vinegar and citric acid,  antioxidant: rosemary extract, stabilizer: methylcellulose		229	13.0	3.8	17.0	3760324300015	0
23	https://images.openfoodfacts.org/images/products/317/568/111/0106/front_fr.164.400.jpg	api	produit	\N	Germe de blé - Gerblé - 250 g	Germe de blé. Fabriqué dans un atelier qui utilise des fruits à coque, du lupin, de l'oeuf, du lait, du sésame et du soja.	Compléments alimentaires	374	30.0	35.0	9.6	3175681110106	0
24	https://images.openfoodfacts.org/images/products/330/274/008/7103/front_fr.28.400.jpg	api	produit	\N	Les Tranches Végé Haricots Blancs - FLEURY MICHON - 120 g	Eau, haricots blancs cuits 19,7%, blanc d'œuf poudre, huile de colza, fécules, bouillon (eau, carottes, oignons, plantes aromatiques, céleri, sel, huile de colza, épices), extrait de plantes, sel, arômes naturels, vinaigre tamponné, poivre, colorant: caramel ordinaire		135	8.1	10.0	6.0	3302740087103	0
25	https://images.openfoodfacts.org/images/products/322/982/079/4112/front_en.116.400.jpg	api	produit	\N	Tofu fumé - Bjorg - 2 x 100g	tofu 96% (water, soybeans*, gelling agents (magnesium chloride (nigari))), soy sauce (water, soybeans*, salt, aspergillus oryzae)		154	16.0	2.1	9.0	3229820794112	0
26	https://images.openfoodfacts.org/images/products/377/001/616/2036/front_fr.68.400.jpg	api	produit	\N	Nuggets Végétaux et Gourmands - HappyVore - 210 g	Eau, chapelure (farine de blé,  épices, sel, levure, huile de tournesol), protéines de blé, farien de blé, amidon de pomme de terre, fibre de bambou, stabilisant : méthycellulose, arôme naturel, fibre de plantain, vinaigre, sel,  extrait romarin, Peut contenir des traces de : céréales contenant du gluten, lait, sésame, soja,	Préparation végétale à base de protéines de blé	252	9.0	20.0	14.0	3770016162036	0
27	https://images.openfoodfacts.org/images/products/541/118/811/4536/front_en.125.400.jpg	api	produit	\N	Soja à la fraise - alpro - 500 g	water, hulled soya beans (9,7%),  strawberry mix (10,9%) (fruit (7%), juice from concentrate (3,9%)),  sugar, acidity regulators (citric acid, sodium citrates, malic acid),  stabiliser (pectins),  calcium [tri-calcium phosphate),  beetroot^, natural flavourings,  black carrot^,  sea salt,  antioxidants (tocopherol-rich extract, fatty acid esters of ascorbic acid), vitamins b2, b12, d2,  live cultures (s, thermophilus, l, bulgaricus),	Fermented soya product with strawberry, with added calcium and vitamins	68	3.6	8.1	2.1	5411188114536	0
28	https://images.openfoodfacts.org/images/products/322/982/079/4556/front_fr.129.400.jpg	api	produit	\N	Muesli Protéines - bjorg - 375 g	Flocons de soja* 33%, flocons d'avoine* 26%, flocons de blé* 25%, raisins secs* 8% (raisins*, huile de tournesol*), dattes* 5% (dattes*, farine de riz*), fruits rouges* lyophilisés 1,4% (groseilles*, cassis*, fraises*), graines de sarrasin* 1%. *Ingrédients biologiques	Muesli aux protéines de soja et aux dattes	382	21.0	41.0	12.0	3229820794556	0
30	https://images.openfoodfacts.org/images/products/000/002/072/4696/front_en.384.400.jpg	api	produit	\N	Mandeln - Alesto, Lidl - 200g	shelled almonds		621	24.5	4.8	53.3	20724696	0
31	https://images.openfoodfacts.org/images/products/000/002/026/7605/front_en.503.400.jpg	api	produit	\N	Cashewkerne - Alesto, 05 x Lidl 10.25 - 200g	Cashews		600	20.5	19.8	47.6	20267605	0
41	https://images.openfoodfacts.org/images/products/000/005/016/0884/front_en.108.400.jpg	api	produit	\N	Vegan Bouillon powder - Marigold - 150g	Sea salt, Potato starch, Hydrolysed vegetable protein (containing soya), Vegetable oil (sunflower, rapeseed), vegetables 7% (onion, parsnip, carrot, leek), Celery seed, Parsley, Turmeric, White pepper, Garlic, Mace, Lovage, Nutmeg.		241	9.6	30.6	8.4	50160884	0
42	https://images.openfoodfacts.org/images/products/611/124/210/0930/front_fr.48.400.jpg	api	produit	\N	raibi jaoda - Jaouda - 165g	lait frais partiellement écrémé'sucre'colorant:amidon ' arôme 'correcteur d'acidité :acide citrique'ferments lactiques sélectionnés' matière grasse:1'3%		75	2.5	13.6	1.4	6111242100930	0
43	https://images.openfoodfacts.org/images/products/000/000/617/5700/front_fr.90.400.jpg	api	produit	\N	Tartines craquantes au sarrasin imp - Ekibio,Le pain des Fleurs - 160 g	Farine de sarrasin* (97,6%), sucre de canne complet* (&lt;2%), sel marin. *issu de l'agriculture biologique.		388	13.4	75.0	2.8	06175700	0
45	https://images.openfoodfacts.org/images/products/501/366/511/2273/front_en.62.400.jpg	api	produit	\N	Organic Vegetable Stock Cubes - Kallø - 88g	Sea salt, potato starch, sustainable palm oil, sugar, vegetables 6.8% (_celery_, onion, parsnip, tomato), sunflower oil, yeast extract, caramelised sugar, herbs and spices (lovage, turmeric, parsely, black pepper).		7	0	0.7	0.4	5013665112273	0
46	https://images.openfoodfacts.org/images/products/322/982/001/9307/front_fr.300.400.jpg	api	produit	\N	Flocons d'avoine - Bjorg - 500 g	Flocons d'_avoine_ complète issue de l'agriculture biologique.	Flocons d'avoine	362	11.0	58.0	7.1	3229820019307	0
29	https://images.openfoodfacts.org/images/products/000/005/018/4453/front_en.126.400.jpg	api	produit	\N	Marmite Yeast Extract - Marmite,Unilever - 250g	yeast extract, barley, wheat, oats, rye, salt, vegetable juice concentrate, thiamin, riboflavin, niacin, vitamin B12, folic acid, natural flavouring, celery	Yeast Extract Spread	260	34.0	30.0	0.5	50184453	0
32	https://images.openfoodfacts.org/images/products/842/519/771/2024/front_en.60.400.jpg	api	produit	\N	Produit sans nom - Maruja - 150 g	sugar, cocoa butter, whole milk powder, cocoa mass, almonds, emulsifier (soya lecithin), flavoring	Compound Chocolate with MILK AND ALMONDS	539	7.2	53.0	33.0	8425197712024	0
34	https://images.openfoodfacts.org/images/products/611/120/300/1467/front_fr.24.400.jpg	api	produit	\N	margarine la prairie 225g - la Prairie - 250g	Corps gras végétal, eau, sucre, sel, mono-diglycérides végétales, lécithine de soja, calcium, amidon, sorbate de potassium, antioxydant, acide citrique, arôme, β-carotène, 7 vitamines : A, B6, B2, B1, E, D et B12.		635	1.0	0.7	70.0	6111203001467	0
35	https://images.openfoodfacts.org/images/products/501/002/900/0016/front_en.44.400.jpg	api	produit	\N	Weetabix - Weetabix - 430 g	Wholegrain Wheat (95%), Malted Barley Extract, Sugar, Salt, Niacin, Iron, Riboflavin (B2), Thiamin (B1), Folic Acid.		358	11.8	68.4	2.1	5010029000016	0
36	https://images.openfoodfacts.org/images/products/506/004/264/1000/front_en.179.400.jpg	api	produit	\N	Lightly sea salted crisps - Tyrrell's - 150g	Kartoffeln, Sonnenblumenöl, Meersalz.	Chips de pommes de terre légèrement salées au sel de mer	476	6.2	49.0	27.0	5060042641000	0
37	https://images.openfoodfacts.org/images/products/501/366/510/0065/front_en.58.400.jpg	api	produit	\N	Organic Lightly Salted Wholegrain Low Fat Rice Cakes - Kallo - 130 g	Organic wholegrain _rice_ 99.8%, Sea Salt	Organic lightly salted wholegrain rice cakes	394	8.5	82.3	2.7	5013665100065	0
38	https://images.openfoodfacts.org/images/products/731/107/003/2611/front_en.91.400.jpg	api	produit	\N	Krisprolls complets sans sucres ajoutés - Krisprolls - 425 g	Whole wheat flour (62%), wheat flour, vegetable oils (fully hydrogenated rapeseed oil), barley malt, yeast, salt.		400	13.0	68.0	6.6	7311070032611	0
39	https://images.openfoodfacts.org/images/products/316/893/001/0265/front_en.206.400.jpg	api	produit	\N	cruesly mélange de noix - Quaker - 450 g	_avoine_ complète (32%), _blé_ complet (18%), sirop de glucose, huile de tournesol, sucre, _amandes_ grillées (4,2%), _noisettes_ (4%), oligofructose, _noix de Pécan_ (1,5%), farine de _blé_, farine de riz, _noix du Brésil_ (1%), miel, arômes naturels, antioxydant (tocophérol).	Pépites de céréales croustillantes avec Mélange de Noix	462	8.5	57.0	19.0	3168930010265	0
40	https://images.openfoodfacts.org/images/products/315/525/035/8788/front_en.166.400.jpg	api	produit	\N	Primevère bio doux tartine & cuisson - Primevère - 250 g	Huiles végétales biologiques non hydrogénées 54.5% (colza*, palme*), eau, émulsifiant (lécithine de tournesol biologique*), sel, arôme naturel de noix de coco biologique*, jus de citron concentré biologique*	Matière grasse à tartiner et à cuire allégée (55% de MG) issue de l'agriculture biologique	485	0	0	55.0	3155250358788	0
44	https://images.openfoodfacts.org/images/products/501/002/900/0801/front_en.60.400.jpg	api	produit	\N	Family Pack - Weetabix - 860 g	Wholegrain _Wheat_ (95%), Malted _Barley_ Extract, Sugar, Salt, Niacin, Iron, Riboflavin (B2), Thiamin (B1), Folic Acid.	Whole wheat cereal enriched with vitamins and iron	362	12.0	74.0	2.0	5010029000801	0
48	https://images.openfoodfacts.org/images/products/376/004/979/0214/front_en.249.400.jpg	api	produit	\N	Pain De Mie Bio - La Boulangère,La Boulangère Bio - 500 g	wheat flour*, water, whole wheat flour* 13%, brown cane sugar*, yeast, rapeseed oil*, apple cider vinegar*, wheat bran*, salt, wheat gluten*, ascorbic acid, possible traces of soy		268	8.1	47.0	4.2	3760049790214	0
33	https://images.openfoodfacts.org/images/products/739/437/661/6228/front_en.182.400.jpg	api	produit	\N	Oat Drink Barista Edition - Oatly - 1l	water,  oats  10%, rapeseed oil, acidity regulator (dipotassium phosphate), minerals (calcium carbonate, potassium iodide), salt, vitamins (d2, riboflavin and b12),	Foamable oat drink with added vitamins and minerals	61	1.1	7.1	3.0	7394376616228	0
47	https://images.openfoodfacts.org/images/products/322/982/016/0672/front_fr.312.400.jpg	api	produit	\N	Croustillant Chocolat - Bjorg - 500 g	Flocons d'avoine complète, Flocons de blé complet, Chocolat noir 8% (pâte de cacao, sucre de canne non raffiné, beurre de cacao), Riz extrudé (farine de riz), Sucre de canne non raffiné, Farine de blé, Huile de tournesol, Miel, Stabilisant: gomme d'acacia, Mélasses, Flocons de noix de coco, Sel marin, Cannelle, Antioxydant: extrait riche en tocophérols.	Pépites croustillantes de céréales au chocolat noir	433	9.8	62.0	14.0	3229820160672	0
\.


--
-- Data for Name: aliments_tags; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.aliments_tags (id_aliment, id_tag) FROM stdin;
1	34
1	35
1	36
2	37
2	35
2	38
3	39
3	40
3	41
4	34
4	36
4	35
5	37
5	40
5	42
6	43
6	44
6	45
7	46
7	47
7	48
8	49
8	50
8	51
\.


--
-- Data for Name: badges; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.badges (id_badge, nom, image, description, condition_obtention) FROM stdin;
1	Premier Aliment	/assets/images/badges/1-premier-aliment.png	Obtenu après avoir ajouté le premier aliment à son suivi.	ADD_FIRST_FOOD
2	Première Séance	/assets/images/badges/2-premiere-seance.png	Obtenu après avoir effectué une première séance.	DO_FIRST_SESSION
3	1er Jour	/assets/images/badges/3-serie-un-jour.png	Obtenu après avoir complété tous les objectifs du premier jour.	FIRST_DAY_COMPLETED
4	7 Jours	/assets/images/badges/4-serie-sept-jours.png	Obtenu après avoir complété tous les objectifs des 7 premiers jours.	SEVEN_DAYS_COMPLETED
\.


--
-- Data for Name: badges_utilisateurs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.badges_utilisateurs (id_badge_utilisateur, id_user, id_badge, date_obtention) FROM stdin;
\.


--
-- Data for Name: evaluations_recettes; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.evaluations_recettes (id_evaluation_recette, id_aliment, id_user, evaluation) FROM stdin;
\.


--
-- Data for Name: evolutions; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.evolutions (id_evolution, id_user, date, poids, taille) FROM stdin;
1	2	2025-11-20	64	182
\.


--
-- Data for Name: exercices; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.exercices (id_exercice, nom, gif, description, equipement) FROM stdin;
1	Échauffement	/assets/images/exercices/1-warm-up.gif	Série de mouvements dynamiques pour préparer les muscles et les articulations. Incluez de légers étirements, rotations des épaules, des poignets, des hanches et mobilisation générale.	\N
2	Développé couché	/assets/images/exercices/2-bench-press.gif	Allongé sur un banc, tenez une barre au-dessus de votre poitrine, bras tendus. Abaissez lentement la barre jusqu'à ce qu'elle touche votre poitrine, puis repoussez-la vers le haut.	Banc de musculation, barre et poids
3	Dips sur chaise	/assets/images/exercices/3-dips.gif	Placez vos mains sur le bord d'une chaise ou d'un banc, jambes tendues devant vous. Pliez les coudes pour descendre le corps, puis remontez en position initiale.	Chaise stable ou banc
4	Développé militaire	/assets/images/exercices/4-shoulder-press.gif	Debout ou assis, tenez une barre ou des haltères au niveau des épaules, paumes vers l'avant. Poussez vers le haut jusqu'à l'extension complète des bras, puis redescendez lentement.	Barre ou haltères
5	Étirements	/assets/images/exercices/5-stretching.gif	Série d'étirements statiques ciblant les principaux groupes musculaires travaillés. Maintenez chaque position 20-30 secondes sans rebondir.	\N
6	Tractions assistées	/assets/images/exercices/6-pull-up-assisted.gif	Utilisez un élastique ou une machine d'assistance pour vous aider à tirer votre corps vers une barre. Saisissez la barre, bras tendus, et tirez jusqu'à ce que votre menton dépasse la barre.	Barre de traction, élastique ou machine d'assistance
7	Rowing haltères	/assets/images/exercices/7-rowing.gif	Penché en avant, un genou et une main sur un banc, tirez l'haltère vers votre hanche en gardant le coude près du corps. Contrôlez la descente et répétez.	Haltère, banc
8	Curl biceps	/assets/images/exercices/8-curl-biceps-dumbell.gif	Debout, bras le long du corps, paumes vers l'avant, fléchissez les coudes pour amener les haltères vers vos épaules. Gardez les coudes près du corps et redescendez lentement.	Haltères
9	Squat	/assets/images/exercices/9-squat.gif	Debout, pieds écartés à largeur d'épaules, descendez comme pour vous asseoir en poussant les hanches vers l'arrière, genoux alignés avec les orteils. Remontez en poussant sur vos talons.	Barre et poids (optionnel)
10	Presse à jambes	/assets/images/exercices/10-leg-press.gif	Assis dans la machine, pieds sur la plateforme à largeur d'épaules, poussez jusqu'à extension presque complète des jambes, puis contrôlez le retour à la position de départ.	Machine presse à jambes
11	Extension mollets debout	/assets/images/exercices/11-calf-extensions.gif	Debout sur le bord d'une marche ou d'une plateforme, talons dans le vide, montez sur la pointe des pieds aussi haut que possible, puis redescendez sous le niveau de départ.	Marche ou plateforme surélevée, barre ou haltères (optionnel)
12	Curl à la barre	/assets/images/exercices/12-curl-biceps-barbell.gif	Debout, tenez une barre droite ou EZ à bout de bras, paumes vers l'avant. Fléchissez les coudes pour amener la barre vers vos épaules, puis redescendez lentement.	Barre droite ou EZ
13	Gainage	/assets/images/exercices/13-plank.gif	En position de planche sur les avant-bras et les orteils, maintenez votre corps en ligne droite, abdominaux contractés, sans laisser les hanches s'affaisser.	\N
14	Fentes	/assets/images/exercices/14-lunges.gif	Debout, faites un grand pas en avant, pliez les deux genoux à 90° (genou arrière près du sol), puis poussez sur le pied avant pour revenir à la position initiale.	Haltères (optionnel)
15	Tractions	/assets/images/exercices/15-pull-up.gif	Suspendez-vous à une barre, mains en pronation (paumes vers l'avant), tirez votre corps vers le haut jusqu'à ce que votre menton dépasse la barre, puis redescendez lentement.	Barre de traction
16	Élévations latérales	/assets/images/exercices/16-lateral-raise.gif	Debout, haltères le long du corps, paumes face à vous, soulevez les bras sur les côtés jusqu'à hauteur d'épaule (formant un T), puis redescendez lentement.	Haltères légers
\.


--
-- Data for Name: exercices_seances; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.exercices_seances (id_exercice_seance, id_exercice, id_seance, ordre_exercice, repetitions, series, duree) FROM stdin;
1	1	1	1	\N	\N	5
2	2	1	2	12	3	0
3	3	1	3	8	4	0
4	4	1	4	10	3	0
5	5	1	5	\N	\N	10
6	1	2	1	\N	\N	5
7	6	2	2	8	3	0
8	7	2	3	12	3	0
9	8	2	4	14	3	0
10	5	2	5	\N	\N	10
11	1	3	1	\N	\N	5
12	9	3	2	12	3	0
13	10	3	3	12	3	0
14	11	3	4	15	3	0
15	5	3	5	\N	\N	10
16	1	4	1	\N	\N	5
17	2	4	2	12	4	0
18	12	4	3	14	3	0
19	13	4	4	\N	1	1
20	5	4	5	\N	\N	10
21	1	5	1	\N	\N	5
22	9	5	2	12	4	0
23	11	5	3	12	4	0
24	14	5	4	12	3	0
25	5	5	5	\N	\N	10
26	1	6	1	\N	\N	5
27	15	6	2	10	3	0
28	3	6	3	15	4	0
29	16	6	4	8	4	0
30	5	6	5	\N	\N	10
\.


--
-- Data for Name: exercices_tags; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.exercices_tags (id_exercice, id_tag) FROM stdin;
1	19
1	20
1	18
1	21
2	7
2	8
2	2
3	8
3	7
3	1
4	9
4	33
4	8
4	26
5	22
5	23
5	20
5	24
6	10
6	11
6	1
7	10
7	11
7	25
8	11
8	17
9	16
9	13
9	12
10	16
10	13
11	14
11	17
12	11
12	17
13	15
13	27
13	28
13	29
14	16
14	13
14	30
14	31
15	10
15	11
15	32
16	9
16	33
16	17
\.


--
-- Data for Name: niveaux_sedentarites; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.niveaux_sedentarites (id_niveau_sedentarite, nom, description, valeur) FROM stdin;
1	Très faible	Travail de bureau, peu de mouvement	1.2
2	Faible	Activité légère, marche occasionnelle	1.375
3	Modéré	Actif au quotidien, marche régulière	1.55
4	Élevé	Travail physique intense, sport régulier	1.725
5	Super actif	Très actif, sport quotidien intense	1.9
\.


--
-- Data for Name: objectifs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.objectifs (id_objectif, titre) FROM stdin;
1	Ajouter un aliment à son suivi quotidien
2	Effectuer la séance du jour
\.


--
-- Data for Name: objectifs_utilisateurs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.objectifs_utilisateurs (id_objectif_utilisateur, id_user, id_objectif, date, statut) FROM stdin;
1	2	1	2025-11-20	not_done
2	2	1	2025-11-20	not_done
3	2	2	2025-11-20	not_done
4	2	2	2025-11-20	not_done
5	2	1	2025-12-15	not_done
6	2	1	2025-12-15	not_done
7	2	2	2025-12-15	not_done
8	2	2	2025-12-15	not_done
\.


--
-- Data for Name: preferences; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.preferences (id_preference, id_user, objectif_poids, id_repartition_nutritionnelle, id_regime_alimentaire, id_niveau_sedentarite, seances_par_semaines, bmr, tdee, calories_quotidiennes, duree_objectif_semaines, deficit_surplus_calorique) FROM stdin;
1	2	70	6	1	3	1	1693	2623	2886	26	262
\.


--
-- Data for Name: preferences_activites; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.preferences_activites (id_preference, id_activite) FROM stdin;
1	4
\.


--
-- Data for Name: programmes; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.programmes (id_programme, id_user, nom, image, duree) FROM stdin;
1	1	PPL débutant 10|Programme PPL débutant sur 10 semaines pour développer force et endurance musculaire	/assets/images/programmes/1-PPL-Debutant.png	10
2	1	Full Power 8|Routine intermédiaire de 8 semaines ciblant force, volume et équilibre musculaire	/assets/images/programmes/2-Full-Power-8.png	8
\.


--
-- Data for Name: programmes_tags; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.programmes_tags (id_programme, id_tag) FROM stdin;
1	1
1	2
1	3
1	4
2	5
2	2
2	6
2	4
\.


--
-- Data for Name: programmes_utilisateurs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.programmes_utilisateurs (id_programme_utilisateur, id_programme, id_user, date_debut, date_fin) FROM stdin;
\.


--
-- Data for Name: recettes_du_jour; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.recettes_du_jour (id_recette_du_jour, date, id_aliment) FROM stdin;
\.


--
-- Data for Name: regimes_alimentaires; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.regimes_alimentaires (id_regime_alimentaire, nom, description) FROM stdin;
1	Aucun	Régime standard équilibré
2	Végétarien	Sans viandes, avec des produits laitiers
3	Végétalien	Aliments d'origine végétale
4	Sans gluten	Sans blé ni céréales
5	Sans lactose	Sans produits laitiers ni dérivés
\.


--
-- Data for Name: repartitions_nutritionnelles; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.repartitions_nutritionnelles (id_repartition_nutritionnelle, nom, description, type, pourcentage_glucides, pourcentage_proteines, pourcentage_lipides) FROM stdin;
1	Cardio	Ce plan est conçu pour ceux qui pratiquent régulièrement des activités cardio comme la course, le vélo ou la natation. L’accent est mis sur un apport plus élevé en glucides pour fournir de l’énergie rapide nécessaire à l’endurance, tout en maintenant un apport adéquat en protéines pour préserver la masse musculaire.	perte_de_poids	60	20	20
2	Athlète	Adapté aux athlètes qui souhaitent optimiser leurs performances sportives tout en perdant du poids. La combinaison de glucides pour l’énergie, de protéines pour la réparation musculaire, et de graisses saines pour la récupération permet une approche équilibrée.	perte_de_poids	55	20	25
3	Durable	Ce plan favorise une approche progressive et durable de la perte de poids. Il est idéal pour ceux qui souhaitent maigrir sans sacrifier l’équilibre nutritionnel. Les protéines sont légèrement réduites, tandis que l'apport en graisses reste relativement élevé pour favoriser la satiété et un bon métabolisme lipidique.	perte_de_poids	55	15	30
4	Cardio	Ce plan est destiné aux sportifs qui combinent cardio et musculation légère. L'apport élevé en glucides soutient les performances pendant les séances d’entraînement cardio, tandis que les protéines permettent une légère augmentation musculaire.	prise_de_poids	60	20	20
5	Athlète	Ce programme a été conçu pour les athlètes qui souhaitent développer leur masse musculaire tout en maintenant un niveau de performance élevé. Un apport équilibré entre glucides, protéines et graisses soutient à la fois la récupération musculaire et les besoins énergétiques élevés.	prise_de_poids	55	20	25
6	Se muscler	Ce plan est idéal pour les adeptes de musculation cherchant à augmenter leur masse musculaire. L'apport en protéines est ici maximisé (25 %) pour favoriser la synthèse musculaire, tandis que l’apport équilibré en glucides et graisses garantit l’énergie nécessaire pour les entraînements intensifs.	prise_de_poids	50	25	25
7	Cardio	Plan nutritionnel adapté aux personnes pratiquant des exercices cardio réguliers. L'accent est mis sur un équilibre entre glucides, protéines et graisses pour maintenir une bonne forme physique.	maintien	60	20	20
8	Durable	Un plan équilibré qui peut être maintenu sur le long terme, avec un apport suffisant en glucides pour l'énergie, des protéines pour le maintien musculaire et des graisses pour une bonne santé générale.	maintien	55	15	30
9	Athlète	Pour les athlètes qui cherchent à maintenir leurs performances tout en équilibrant leur alimentation avec une proportion adéquate de glucides, protéines et graisses.	maintien	55	20	25
10	Se muscler	Plan nutritionnel pour ceux qui cherchent à maintenir ou augmenter leur masse musculaire tout en maintenant une alimentation équilibrée.	maintien	50	25	25
\.


--
-- Data for Name: seances; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.seances (id_seance, nom, id_user) FROM stdin;
1	Push (Pectoraux, triceps, épaules)	1
2	Pull (Dos, Biceps)	1
3	Legs (Jambes, fessiers, mollets)	1
4	Haut du corps (Pectoraux, biceps, abdominaux)	1
5	Bas du corps (Cuisses, fessiers, mollets)	1
6	Haut du corps (Dos, épaules, triceps)	1
\.


--
-- Data for Name: seances_programmes; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.seances_programmes (id_seance_programme, id_seance, id_programme, ordre_seance) FROM stdin;
1	1	1	1
2	2	1	2
3	3	1	3
4	4	2	1
5	5	2	2
6	6	2	3
\.


--
-- Data for Name: seances_tags; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.seances_tags (id_seance, id_tag) FROM stdin;
1	2
1	3
1	7
1	8
1	9
2	2
2	3
2	10
2	11
3	2
3	3
3	12
3	13
3	14
4	2
4	6
4	7
4	11
4	15
5	2
5	6
5	12
5	13
5	14
6	2
6	6
6	10
6	9
6	8
\.


--
-- Data for Name: signalements; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.signalements (id_signalement, titre) FROM stdin;
\.


--
-- Data for Name: signalements_utilisateurs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.signalements_utilisateurs (id_signalement_utilisateur, id_user, id_signalement, id_aliment, description, date, statut) FROM stdin;
\.


--
-- Data for Name: suivis_nutritionnels; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.suivis_nutritionnels (id_suivi_nutritionnel, id_user, id_aliment, date, repas, quantite) FROM stdin;
\.


--
-- Data for Name: suivis_sportifs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.suivis_sportifs (id_suivi_sportif, id_user, id_seance, date) FROM stdin;
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.tags (id_tag, nom, type) FROM stdin;
1	débutant	sport
2	force	sport
3	endurance	sport
4	full-body	sport
5	intermédiaire	sport
6	volume	sport
7	pectoraux	sport
8	triceps	sport
9	épaules	sport
10	dos	sport
11	biceps	sport
12	jambes	sport
13	fessiers	sport
14	mollets	sport
15	abdominaux	sport
16	quadriceps	sport
17	isolation	sport
18	activation	sport
19	préparation	sport
20	mobilité	sport
21	sécurité	sport
22	récupération	sport
23	souplesse	sport
24	détente	sport
25	pull	sport
26	push	sport
27	core	sport
28	stabilité	sport
29	isométrique	sport
30	unilatéral	sport
31	équilibre	sport
32	avancé	sport
33	deltoïdes	sport
34	pâte-à-tartiner	aliment
35	chocolat	aliment
36	noisettes	aliment
37	biscuits	aliment
38	goûter	aliment
39	fruits-sec	aliment
40	snack	aliment
41	noix	aliment
42	salé	aliment
43	salade	aliment
44	végétarien	aliment
45	avocat	aliment
46	pâtes	aliment
47	tomates	aliment
48	mozzarella	aliment
49	riz	aliment
50	accompagnement	aliment
51	cuisine-simple	aliment
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id_user, role, prenom, nom, sexe, date_de_naissance, email, mot_de_passe, cree_a, mis_a_jour_a) FROM stdin;
1	admin	admin	admin	NS	1990-01-01	admin@admin.com	$2b$10$YKtYalxJ/smsfLgsJ7hb/.F1XUlT4jxx2iGXHiCkQyNrqjwCiRMay	2025-11-18 15:19:42.571	2025-11-18 15:19:42.571
2	user	r	df	H	2007-10-01	a@s.com	$2b$10$Aernmc7v2cPmNjrRpxI6GuYAGv9CmA8czQ4DuIIXfHDITkArObmAu	2025-11-20 19:45:22.88	2025-12-15 14:02:46.627
\.


--
-- Name: activites_id_activite_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.activites_id_activite_seq', 5, true);


--
-- Name: aliments_id_aliment_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.aliments_id_aliment_seq', 48, true);


--
-- Name: badges_id_badge_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.badges_id_badge_seq', 4, true);


--
-- Name: badges_utilisateurs_id_badge_utilisateur_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.badges_utilisateurs_id_badge_utilisateur_seq', 1, false);


--
-- Name: evaluations_recettes_id_evaluation_recette_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.evaluations_recettes_id_evaluation_recette_seq', 1, false);


--
-- Name: evolutions_id_evolution_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.evolutions_id_evolution_seq', 1, true);


--
-- Name: exercices_id_exercice_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.exercices_id_exercice_seq', 16, true);


--
-- Name: exercices_seances_id_exercice_seance_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.exercices_seances_id_exercice_seance_seq', 30, true);


--
-- Name: niveaux_sedentarites_id_niveau_sedentarite_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.niveaux_sedentarites_id_niveau_sedentarite_seq', 5, true);


--
-- Name: objectifs_id_objectif_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.objectifs_id_objectif_seq', 2, true);


--
-- Name: objectifs_utilisateurs_id_objectif_utilisateur_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.objectifs_utilisateurs_id_objectif_utilisateur_seq', 8, true);


--
-- Name: preferences_id_preference_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.preferences_id_preference_seq', 1, true);


--
-- Name: programmes_id_programme_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.programmes_id_programme_seq', 2, true);


--
-- Name: programmes_utilisateurs_id_programme_utilisateur_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.programmes_utilisateurs_id_programme_utilisateur_seq', 1, false);


--
-- Name: recettes_du_jour_id_recette_du_jour_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.recettes_du_jour_id_recette_du_jour_seq', 1, false);


--
-- Name: regimes_alimentaires_id_regime_alimentaire_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.regimes_alimentaires_id_regime_alimentaire_seq', 5, true);


--
-- Name: repartitions_nutritionnelles_id_repartition_nutritionnelle_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.repartitions_nutritionnelles_id_repartition_nutritionnelle_seq', 10, true);


--
-- Name: seances_id_seance_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.seances_id_seance_seq', 6, true);


--
-- Name: seances_programmes_id_seance_programme_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.seances_programmes_id_seance_programme_seq', 6, true);


--
-- Name: signalements_id_signalement_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.signalements_id_signalement_seq', 1, false);


--
-- Name: signalements_utilisateurs_id_signalement_utilisateur_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.signalements_utilisateurs_id_signalement_utilisateur_seq', 1, false);


--
-- Name: suivis_nutritionnels_id_suivi_nutritionnel_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.suivis_nutritionnels_id_suivi_nutritionnel_seq', 1, false);


--
-- Name: suivis_sportifs_id_suivi_sportif_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.suivis_sportifs_id_suivi_sportif_seq', 1, false);


--
-- Name: tags_id_tag_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.tags_id_tag_seq', 51, true);


--
-- Name: users_id_user_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.users_id_user_seq', 7, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: activites activites_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.activites
    ADD CONSTRAINT activites_pkey PRIMARY KEY (id_activite);


--
-- Name: aliments aliments_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.aliments
    ADD CONSTRAINT aliments_pkey PRIMARY KEY (id_aliment);


--
-- Name: aliments_tags aliments_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.aliments_tags
    ADD CONSTRAINT aliments_tags_pkey PRIMARY KEY (id_aliment, id_tag);


--
-- Name: badges badges_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id_badge);


--
-- Name: badges_utilisateurs badges_utilisateurs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.badges_utilisateurs
    ADD CONSTRAINT badges_utilisateurs_pkey PRIMARY KEY (id_badge_utilisateur);


--
-- Name: evaluations_recettes evaluations_recettes_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluations_recettes
    ADD CONSTRAINT evaluations_recettes_pkey PRIMARY KEY (id_evaluation_recette);


--
-- Name: evolutions evolutions_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evolutions
    ADD CONSTRAINT evolutions_pkey PRIMARY KEY (id_evolution);


--
-- Name: exercices exercices_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exercices
    ADD CONSTRAINT exercices_pkey PRIMARY KEY (id_exercice);


--
-- Name: exercices_seances exercices_seances_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exercices_seances
    ADD CONSTRAINT exercices_seances_pkey PRIMARY KEY (id_exercice_seance);


--
-- Name: exercices_tags exercices_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exercices_tags
    ADD CONSTRAINT exercices_tags_pkey PRIMARY KEY (id_exercice, id_tag);


--
-- Name: niveaux_sedentarites niveaux_sedentarites_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.niveaux_sedentarites
    ADD CONSTRAINT niveaux_sedentarites_pkey PRIMARY KEY (id_niveau_sedentarite);


--
-- Name: objectifs objectifs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.objectifs
    ADD CONSTRAINT objectifs_pkey PRIMARY KEY (id_objectif);


--
-- Name: objectifs_utilisateurs objectifs_utilisateurs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.objectifs_utilisateurs
    ADD CONSTRAINT objectifs_utilisateurs_pkey PRIMARY KEY (id_objectif_utilisateur);


--
-- Name: preferences_activites preferences_activites_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.preferences_activites
    ADD CONSTRAINT preferences_activites_pkey PRIMARY KEY (id_preference, id_activite);


--
-- Name: preferences preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.preferences
    ADD CONSTRAINT preferences_pkey PRIMARY KEY (id_preference);


--
-- Name: programmes programmes_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.programmes
    ADD CONSTRAINT programmes_pkey PRIMARY KEY (id_programme);


--
-- Name: programmes_tags programmes_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.programmes_tags
    ADD CONSTRAINT programmes_tags_pkey PRIMARY KEY (id_programme, id_tag);


--
-- Name: programmes_utilisateurs programmes_utilisateurs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.programmes_utilisateurs
    ADD CONSTRAINT programmes_utilisateurs_pkey PRIMARY KEY (id_programme_utilisateur);


--
-- Name: recettes_du_jour recettes_du_jour_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.recettes_du_jour
    ADD CONSTRAINT recettes_du_jour_pkey PRIMARY KEY (id_recette_du_jour);


--
-- Name: regimes_alimentaires regimes_alimentaires_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.regimes_alimentaires
    ADD CONSTRAINT regimes_alimentaires_pkey PRIMARY KEY (id_regime_alimentaire);


--
-- Name: repartitions_nutritionnelles repartitions_nutritionnelles_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.repartitions_nutritionnelles
    ADD CONSTRAINT repartitions_nutritionnelles_pkey PRIMARY KEY (id_repartition_nutritionnelle);


--
-- Name: seances seances_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.seances
    ADD CONSTRAINT seances_pkey PRIMARY KEY (id_seance);


--
-- Name: seances_programmes seances_programmes_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.seances_programmes
    ADD CONSTRAINT seances_programmes_pkey PRIMARY KEY (id_seance_programme);


--
-- Name: seances_tags seances_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.seances_tags
    ADD CONSTRAINT seances_tags_pkey PRIMARY KEY (id_seance, id_tag);


--
-- Name: signalements signalements_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.signalements
    ADD CONSTRAINT signalements_pkey PRIMARY KEY (id_signalement);


--
-- Name: signalements_utilisateurs signalements_utilisateurs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.signalements_utilisateurs
    ADD CONSTRAINT signalements_utilisateurs_pkey PRIMARY KEY (id_signalement_utilisateur);


--
-- Name: suivis_nutritionnels suivis_nutritionnels_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.suivis_nutritionnels
    ADD CONSTRAINT suivis_nutritionnels_pkey PRIMARY KEY (id_suivi_nutritionnel);


--
-- Name: suivis_sportifs suivis_sportifs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.suivis_sportifs
    ADD CONSTRAINT suivis_sportifs_pkey PRIMARY KEY (id_suivi_sportif);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id_tag);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id_user);


--
-- Name: activites_nom_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX activites_nom_key ON public.activites USING btree (nom);


--
-- Name: regimes_alimentaires_nom_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX regimes_alimentaires_nom_key ON public.regimes_alimentaires USING btree (nom);


--
-- Name: tags_nom_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX tags_nom_key ON public.tags USING btree (nom);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: exercices_seances exercices_seances_id_exercice_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exercices_seances
    ADD CONSTRAINT exercices_seances_id_exercice_fkey FOREIGN KEY (id_exercice) REFERENCES public.exercices(id_exercice);


--
-- Name: exercices_seances exercices_seances_id_seance_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exercices_seances
    ADD CONSTRAINT exercices_seances_id_seance_fkey FOREIGN KEY (id_seance) REFERENCES public.seances(id_seance);


--
-- Name: preferences_activites fk_activite; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.preferences_activites
    ADD CONSTRAINT fk_activite FOREIGN KEY (id_activite) REFERENCES public.activites(id_activite);


--
-- Name: aliments_tags fk_aliment; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.aliments_tags
    ADD CONSTRAINT fk_aliment FOREIGN KEY (id_aliment) REFERENCES public.aliments(id_aliment);


--
-- Name: evaluations_recettes fk_aliment; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluations_recettes
    ADD CONSTRAINT fk_aliment FOREIGN KEY (id_aliment) REFERENCES public.aliments(id_aliment);


--
-- Name: signalements_utilisateurs fk_aliment; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.signalements_utilisateurs
    ADD CONSTRAINT fk_aliment FOREIGN KEY (id_aliment) REFERENCES public.aliments(id_aliment);


--
-- Name: suivis_nutritionnels fk_aliment; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.suivis_nutritionnels
    ADD CONSTRAINT fk_aliment FOREIGN KEY (id_aliment) REFERENCES public.aliments(id_aliment);


--
-- Name: badges_utilisateurs fk_badge; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.badges_utilisateurs
    ADD CONSTRAINT fk_badge FOREIGN KEY (id_badge) REFERENCES public.badges(id_badge);


--
-- Name: exercices_tags fk_exercice; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exercices_tags
    ADD CONSTRAINT fk_exercice FOREIGN KEY (id_exercice) REFERENCES public.exercices(id_exercice);


--
-- Name: preferences fk_niveau_sedentarite; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.preferences
    ADD CONSTRAINT fk_niveau_sedentarite FOREIGN KEY (id_niveau_sedentarite) REFERENCES public.niveaux_sedentarites(id_niveau_sedentarite);


--
-- Name: objectifs_utilisateurs fk_objectif; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.objectifs_utilisateurs
    ADD CONSTRAINT fk_objectif FOREIGN KEY (id_objectif) REFERENCES public.objectifs(id_objectif);


--
-- Name: preferences_activites fk_preference; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.preferences_activites
    ADD CONSTRAINT fk_preference FOREIGN KEY (id_preference) REFERENCES public.preferences(id_preference);


--
-- Name: programmes_tags fk_programme; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.programmes_tags
    ADD CONSTRAINT fk_programme FOREIGN KEY (id_programme) REFERENCES public.programmes(id_programme);


--
-- Name: programmes_utilisateurs fk_programme; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.programmes_utilisateurs
    ADD CONSTRAINT fk_programme FOREIGN KEY (id_programme) REFERENCES public.programmes(id_programme);


--
-- Name: seances_programmes fk_programme; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.seances_programmes
    ADD CONSTRAINT fk_programme FOREIGN KEY (id_programme) REFERENCES public.programmes(id_programme);


--
-- Name: recettes_du_jour fk_recette_du_jour; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.recettes_du_jour
    ADD CONSTRAINT fk_recette_du_jour FOREIGN KEY (id_recette_du_jour) REFERENCES public.aliments(id_aliment);


--
-- Name: preferences fk_regime_alimentaire; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.preferences
    ADD CONSTRAINT fk_regime_alimentaire FOREIGN KEY (id_regime_alimentaire) REFERENCES public.regimes_alimentaires(id_regime_alimentaire);


--
-- Name: preferences fk_repartition_nutritionnelle; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.preferences
    ADD CONSTRAINT fk_repartition_nutritionnelle FOREIGN KEY (id_repartition_nutritionnelle) REFERENCES public.repartitions_nutritionnelles(id_repartition_nutritionnelle);


--
-- Name: seances_programmes fk_seance; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.seances_programmes
    ADD CONSTRAINT fk_seance FOREIGN KEY (id_seance) REFERENCES public.seances(id_seance);


--
-- Name: seances_tags fk_seance; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.seances_tags
    ADD CONSTRAINT fk_seance FOREIGN KEY (id_seance) REFERENCES public.seances(id_seance);


--
-- Name: suivis_sportifs fk_seance; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.suivis_sportifs
    ADD CONSTRAINT fk_seance FOREIGN KEY (id_seance) REFERENCES public.seances(id_seance);


--
-- Name: signalements_utilisateurs fk_signalement; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.signalements_utilisateurs
    ADD CONSTRAINT fk_signalement FOREIGN KEY (id_signalement) REFERENCES public.signalements(id_signalement);


--
-- Name: aliments_tags fk_tag; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.aliments_tags
    ADD CONSTRAINT fk_tag FOREIGN KEY (id_tag) REFERENCES public.tags(id_tag);


--
-- Name: exercices_tags fk_tag; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exercices_tags
    ADD CONSTRAINT fk_tag FOREIGN KEY (id_tag) REFERENCES public.tags(id_tag);


--
-- Name: programmes_tags fk_tag; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.programmes_tags
    ADD CONSTRAINT fk_tag FOREIGN KEY (id_tag) REFERENCES public.tags(id_tag);


--
-- Name: seances_tags fk_tag; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.seances_tags
    ADD CONSTRAINT fk_tag FOREIGN KEY (id_tag) REFERENCES public.tags(id_tag);


--
-- Name: aliments fk_user; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.aliments
    ADD CONSTRAINT fk_user FOREIGN KEY (id_user) REFERENCES public.users(id_user);


--
-- Name: badges_utilisateurs fk_user; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.badges_utilisateurs
    ADD CONSTRAINT fk_user FOREIGN KEY (id_user) REFERENCES public.users(id_user);


--
-- Name: evaluations_recettes fk_user; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluations_recettes
    ADD CONSTRAINT fk_user FOREIGN KEY (id_user) REFERENCES public.users(id_user);


--
-- Name: evolutions fk_user; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evolutions
    ADD CONSTRAINT fk_user FOREIGN KEY (id_user) REFERENCES public.users(id_user);


--
-- Name: objectifs_utilisateurs fk_user; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.objectifs_utilisateurs
    ADD CONSTRAINT fk_user FOREIGN KEY (id_user) REFERENCES public.users(id_user);


--
-- Name: preferences fk_user; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.preferences
    ADD CONSTRAINT fk_user FOREIGN KEY (id_user) REFERENCES public.users(id_user);


--
-- Name: programmes fk_user; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.programmes
    ADD CONSTRAINT fk_user FOREIGN KEY (id_user) REFERENCES public.users(id_user);


--
-- Name: programmes_utilisateurs fk_user; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.programmes_utilisateurs
    ADD CONSTRAINT fk_user FOREIGN KEY (id_user) REFERENCES public.users(id_user);


--
-- Name: seances fk_user; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.seances
    ADD CONSTRAINT fk_user FOREIGN KEY (id_user) REFERENCES public.users(id_user);


--
-- Name: signalements_utilisateurs fk_user; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.signalements_utilisateurs
    ADD CONSTRAINT fk_user FOREIGN KEY (id_user) REFERENCES public.users(id_user);


--
-- Name: suivis_nutritionnels fk_user; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.suivis_nutritionnels
    ADD CONSTRAINT fk_user FOREIGN KEY (id_user) REFERENCES public.users(id_user);


--
-- Name: suivis_sportifs fk_user; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.suivis_sportifs
    ADD CONSTRAINT fk_user FOREIGN KEY (id_user) REFERENCES public.users(id_user);


--
-- PostgreSQL database dump complete
--

\unrestrict 730vMHeCszt64sfX6MgfXqgsk2thIaRuT4A2T1YZezMgdY6qWb1pD6lqH47ZBzQ

