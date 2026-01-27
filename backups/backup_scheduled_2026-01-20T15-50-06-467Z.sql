--
-- PostgreSQL database dump
--

\restrict SAEymBaOaO7lb2QjmKYYVTjDhcHsY3f0H0L8SD5UlbdHCC2A82iWdgQVLX8mRwa

-- Dumped from database version 16.11 (f45eb12)
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: neondb_owner
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO neondb_owner;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: neondb_owner
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO neondb_owner;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: neondb_owner
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: backup_execution_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.backup_execution_logs (
    id integer NOT NULL,
    schedule_id integer NOT NULL,
    status character varying NOT NULL,
    scheduled_time timestamp without time zone,
    executed_at timestamp without time zone DEFAULT now(),
    file_size integer,
    error_message character varying,
    sent_to_telegram boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    telegram_message_id character varying,
    notes character varying
);


ALTER TABLE public.backup_execution_logs OWNER TO neondb_owner;

--
-- Name: backup_execution_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.backup_execution_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.backup_execution_logs_id_seq OWNER TO neondb_owner;

--
-- Name: backup_execution_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.backup_execution_logs_id_seq OWNED BY public.backup_execution_logs.id;


--
-- Name: backup_history; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.backup_history (
    id integer NOT NULL,
    filename text NOT NULL,
    file_size integer,
    status text DEFAULT 'sucesso'::text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    was_scheduled boolean DEFAULT false,
    sent_to_telegram boolean DEFAULT false,
    telegram_message_id character varying
);


ALTER TABLE public.backup_history OWNER TO neondb_owner;

--
-- Name: backup_history_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.backup_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.backup_history_id_seq OWNER TO neondb_owner;

--
-- Name: backup_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.backup_history_id_seq OWNED BY public.backup_history.id;


--
-- Name: backup_schedules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.backup_schedules (
    id integer NOT NULL,
    user_id integer NOT NULL,
    frequency character varying NOT NULL,
    scheduled_time character varying NOT NULL,
    timezone character varying DEFAULT '-3'::character varying,
    send_to_telegram boolean DEFAULT true,
    is_active boolean DEFAULT true,
    next_execution_at timestamp without time zone,
    last_executed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.backup_schedules OWNER TO neondb_owner;

--
-- Name: backup_schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.backup_schedules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.backup_schedules_id_seq OWNER TO neondb_owner;

--
-- Name: backup_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.backup_schedules_id_seq OWNED BY public.backup_schedules.id;


--
-- Name: calls; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.calls (
    id integer NOT NULL,
    client_id integer,
    equipment text NOT NULL,
    service_type text NOT NULL,
    priority text DEFAULT 'media'::text NOT NULL,
    description text NOT NULL,
    internal_notes text,
    status text DEFAULT 'aguardando'::text NOT NULL,
    progress integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id integer DEFAULT 1,
    call_date timestamp without time zone,
    display_order integer DEFAULT 0,
    created_by_user_id integer DEFAULT 1
);


ALTER TABLE public.calls OWNER TO neondb_owner;

--
-- Name: calls_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.calls_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calls_id_seq OWNER TO neondb_owner;

--
-- Name: calls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.calls_id_seq OWNED BY public.calls.id;


--
-- Name: client_notes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.client_notes (
    id integer NOT NULL,
    client_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.client_notes OWNER TO neondb_owner;

--
-- Name: client_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.client_notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_notes_id_seq OWNER TO neondb_owner;

--
-- Name: client_notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.client_notes_id_seq OWNED BY public.client_notes.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    cpf text,
    address text,
    city text,
    state text,
    status text DEFAULT 'ativo'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    document_type text DEFAULT 'cpf'::text
);


ALTER TABLE public.clients OWNER TO neondb_owner;

--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clients_id_seq OWNER TO neondb_owner;

--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: digital_certificates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.digital_certificates (
    id integer NOT NULL,
    name text NOT NULL,
    subject_name text,
    issuer_name text,
    serial_number text,
    cnpj text,
    certificate_path text NOT NULL,
    expiry_date timestamp without time zone NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.digital_certificates OWNER TO neondb_owner;

--
-- Name: digital_certificates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.digital_certificates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.digital_certificates_id_seq OWNER TO neondb_owner;

--
-- Name: digital_certificates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.digital_certificates_id_seq OWNED BY public.digital_certificates.id;


--
-- Name: download_links; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.download_links (
    id integer NOT NULL,
    title text NOT NULL,
    url text NOT NULL,
    type text DEFAULT 'system'::text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.download_links OWNER TO neondb_owner;

--
-- Name: download_links_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.download_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.download_links_id_seq OWNER TO neondb_owner;

--
-- Name: download_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.download_links_id_seq OWNED BY public.download_links.id;


--
-- Name: financial_transactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.financial_transactions (
    id integer NOT NULL,
    description text NOT NULL,
    client_id integer,
    call_id integer,
    type text NOT NULL,
    amount numeric(10,2) NOT NULL,
    status text DEFAULT 'pendente'::text NOT NULL,
    due_date timestamp without time zone,
    paid_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id integer DEFAULT 1 NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_by_user_id integer,
    completed_at timestamp without time zone,
    parent_transaction_id integer,
    installment_number integer,
    total_installments integer,
    resolution text,
    service_id integer,
    service_amount numeric(10,2),
    product_amount numeric(10,2),
    service_details text,
    product_details text,
    call_date timestamp without time zone,
    service_date timestamp without time zone,
    billing_date timestamp without time zone DEFAULT now() NOT NULL,
    original_amount numeric(10,2),
    discount_amount numeric(10,2) DEFAULT '0'::numeric,
    created_by_user_id integer DEFAULT 1
);


ALTER TABLE public.financial_transactions OWNER TO neondb_owner;

--
-- Name: financial_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.financial_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.financial_transactions_id_seq OWNER TO neondb_owner;

--
-- Name: financial_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.financial_transactions_id_seq OWNED BY public.financial_transactions.id;


--
-- Name: history_events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.history_events (
    id integer NOT NULL,
    call_id integer,
    service_id integer,
    transaction_id integer,
    event_type text NOT NULL,
    description text,
    user_id integer,
    metadata text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.history_events OWNER TO neondb_owner;

--
-- Name: history_events_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.history_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.history_events_id_seq OWNER TO neondb_owner;

--
-- Name: history_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.history_events_id_seq OWNED BY public.history_events.id;


--
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.inventory_movements (
    id integer NOT NULL,
    product_id integer NOT NULL,
    type text NOT NULL,
    quantity integer NOT NULL,
    reference text,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.inventory_movements OWNER TO neondb_owner;

--
-- Name: inventory_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.inventory_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_movements_id_seq OWNER TO neondb_owner;

--
-- Name: inventory_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.inventory_movements_id_seq OWNED BY public.inventory_movements.id;


--
-- Name: inventory_products; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.inventory_products (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    min_alert integer DEFAULT 2 NOT NULL,
    status text DEFAULT 'ativo'::text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.inventory_products OWNER TO neondb_owner;

--
-- Name: inventory_products_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.inventory_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_products_id_seq OWNER TO neondb_owner;

--
-- Name: inventory_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.inventory_products_id_seq OWNED BY public.inventory_products.id;


--
-- Name: inventory_services; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.inventory_services (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    category text,
    status text DEFAULT 'ativo'::text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.inventory_services OWNER TO neondb_owner;

--
-- Name: inventory_services_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.inventory_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_services_id_seq OWNER TO neondb_owner;

--
-- Name: inventory_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.inventory_services_id_seq OWNED BY public.inventory_services.id;


--
-- Name: knowledge_base; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.knowledge_base (
    id integer NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    problem text NOT NULL,
    solution text NOT NULL,
    keywords text,
    tags text,
    views integer DEFAULT 0,
    helpful integer DEFAULT 0,
    user_id integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.knowledge_base OWNER TO neondb_owner;

--
-- Name: knowledge_base_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.knowledge_base_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.knowledge_base_id_seq OWNER TO neondb_owner;

--
-- Name: knowledge_base_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.knowledge_base_id_seq OWNED BY public.knowledge_base.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    client_id integer,
    title text NOT NULL,
    content text NOT NULL,
    category text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.messages OWNER TO neondb_owner;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO neondb_owner;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notification_preferences (
    id integer NOT NULL,
    user_id integer NOT NULL,
    notification_type text NOT NULL,
    enabled boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notification_preferences OWNER TO neondb_owner;

--
-- Name: notification_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.notification_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_preferences_id_seq OWNER TO neondb_owner;

--
-- Name: notification_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.notification_preferences_id_seq OWNED BY public.notification_preferences.id;


--
-- Name: preventive_maintenance; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.preventive_maintenance (
    id integer NOT NULL,
    client_id integer NOT NULL,
    title text NOT NULL,
    description text,
    equipment_type text,
    frequency text NOT NULL,
    scheduled_date timestamp without time zone NOT NULL,
    completed_date timestamp without time zone,
    status text DEFAULT 'pendente'::text NOT NULL,
    notes text,
    user_id integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.preventive_maintenance OWNER TO neondb_owner;

--
-- Name: preventive_maintenance_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.preventive_maintenance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.preventive_maintenance_id_seq OWNER TO neondb_owner;

--
-- Name: preventive_maintenance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.preventive_maintenance_id_seq OWNED BY public.preventive_maintenance.id;


--
-- Name: quotes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quotes (
    id integer NOT NULL,
    call_id integer,
    client_id integer NOT NULL,
    items text NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT '0'::numeric,
    total numeric(10,2) NOT NULL,
    status text DEFAULT 'pendente'::text NOT NULL,
    valid_until timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    title text NOT NULL,
    description text
);


ALTER TABLE public.quotes OWNER TO neondb_owner;

--
-- Name: quotes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.quotes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quotes_id_seq OWNER TO neondb_owner;

--
-- Name: quotes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.quotes_id_seq OWNED BY public.quotes.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.services (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    base_price numeric(10,2),
    estimated_time text,
    category text,
    client_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    products text,
    service_date timestamp without time zone,
    user_id integer DEFAULT 1,
    created_by_user_id integer DEFAULT 1,
    call_date timestamp without time zone,
    call_id integer,
    priority text DEFAULT 'media'::text NOT NULL
);


ALTER TABLE public.services OWNER TO neondb_owner;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO neondb_owner;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: signature_attempts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.signature_attempts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    attempt_count integer DEFAULT 0 NOT NULL,
    last_attempt timestamp without time zone DEFAULT now() NOT NULL,
    blocked_until timestamp without time zone
);


ALTER TABLE public.signature_attempts OWNER TO neondb_owner;

--
-- Name: signature_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.signature_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.signature_attempts_id_seq OWNER TO neondb_owner;

--
-- Name: signature_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.signature_attempts_id_seq OWNED BY public.signature_attempts.id;


--
-- Name: signature_audit_log; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.signature_audit_log (
    id integer NOT NULL,
    certificate_id integer NOT NULL,
    document_type text NOT NULL,
    document_id integer NOT NULL,
    user_id integer NOT NULL,
    signed_at timestamp without time zone DEFAULT now() NOT NULL,
    ip_address text,
    status text DEFAULT 'success'::text NOT NULL,
    error_message text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.signature_audit_log OWNER TO neondb_owner;

--
-- Name: signature_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.signature_audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.signature_audit_log_id_seq OWNER TO neondb_owner;

--
-- Name: signature_audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.signature_audit_log_id_seq OWNED BY public.signature_audit_log.id;


--
-- Name: system_activation; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.system_activation (
    id integer NOT NULL,
    password_hash text NOT NULL,
    hardware_fingerprint text NOT NULL,
    failed_attempts integer DEFAULT 0,
    blocked_until timestamp without time zone,
    activated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_attempt timestamp without time zone
);


ALTER TABLE public.system_activation OWNER TO neondb_owner;

--
-- Name: system_activation_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.system_activation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_activation_id_seq OWNER TO neondb_owner;

--
-- Name: system_activation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.system_activation_id_seq OWNED BY public.system_activation.id;


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.system_settings (
    id integer NOT NULL,
    company_name text NOT NULL,
    cnpj text NOT NULL,
    address text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    font_size text DEFAULT '18'::text NOT NULL,
    font_family text DEFAULT 'system'::text NOT NULL,
    theme text DEFAULT 'light'::text NOT NULL,
    primary_color text DEFAULT '#2563eb'::text NOT NULL,
    secondary_color text DEFAULT '#00ff41'::text NOT NULL,
    logo text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    pdf_font_size text DEFAULT '10'::text NOT NULL,
    pdf_subtitle text DEFAULT 'Assessoria e Assistência Técnica em Informática'::text,
    pdf_phone1 text,
    pdf_phone2 text,
    card_layout text DEFAULT 'double'::text NOT NULL
);


ALTER TABLE public.system_settings OWNER TO neondb_owner;

--
-- Name: system_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.system_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_settings_id_seq OWNER TO neondb_owner;

--
-- Name: system_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.system_settings_id_seq OWNED BY public.system_settings.id;


--
-- Name: telegram_config; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.telegram_config (
    id integer NOT NULL,
    bot_token text NOT NULL,
    chat_id text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.telegram_config OWNER TO neondb_owner;

--
-- Name: telegram_config_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.telegram_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.telegram_config_id_seq OWNER TO neondb_owner;

--
-- Name: telegram_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.telegram_config_id_seq OWNED BY public.telegram_config.id;


--
-- Name: templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.templates (
    id integer NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    company_name text NOT NULL,
    company_address text,
    company_phone text,
    company_email text,
    logo_url text,
    content text,
    header_content text,
    footer_content text,
    custom_css text,
    font_size text,
    title_font_size text,
    header_alignment text,
    content_alignment text,
    logo_size text,
    primary_color text,
    secondary_color text,
    font_family text,
    line_height text,
    margin_top text,
    margin_bottom text,
    margin_left text,
    margin_right text,
    border_color text,
    border_width text,
    background_color text,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.templates OWNER TO neondb_owner;

--
-- Name: templates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.templates_id_seq OWNER TO neondb_owner;

--
-- Name: templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.templates_id_seq OWNED BY public.templates.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    email text,
    password text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: neondb_owner
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: backup_execution_logs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.backup_execution_logs ALTER COLUMN id SET DEFAULT nextval('public.backup_execution_logs_id_seq'::regclass);


--
-- Name: backup_history id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.backup_history ALTER COLUMN id SET DEFAULT nextval('public.backup_history_id_seq'::regclass);


--
-- Name: backup_schedules id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.backup_schedules ALTER COLUMN id SET DEFAULT nextval('public.backup_schedules_id_seq'::regclass);


--
-- Name: calls id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.calls ALTER COLUMN id SET DEFAULT nextval('public.calls_id_seq'::regclass);


--
-- Name: client_notes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.client_notes ALTER COLUMN id SET DEFAULT nextval('public.client_notes_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: digital_certificates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.digital_certificates ALTER COLUMN id SET DEFAULT nextval('public.digital_certificates_id_seq'::regclass);


--
-- Name: download_links id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.download_links ALTER COLUMN id SET DEFAULT nextval('public.download_links_id_seq'::regclass);


--
-- Name: financial_transactions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.financial_transactions ALTER COLUMN id SET DEFAULT nextval('public.financial_transactions_id_seq'::regclass);


--
-- Name: history_events id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.history_events ALTER COLUMN id SET DEFAULT nextval('public.history_events_id_seq'::regclass);


--
-- Name: inventory_movements id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inventory_movements ALTER COLUMN id SET DEFAULT nextval('public.inventory_movements_id_seq'::regclass);


--
-- Name: inventory_products id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inventory_products ALTER COLUMN id SET DEFAULT nextval('public.inventory_products_id_seq'::regclass);


--
-- Name: inventory_services id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inventory_services ALTER COLUMN id SET DEFAULT nextval('public.inventory_services_id_seq'::regclass);


--
-- Name: knowledge_base id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.knowledge_base ALTER COLUMN id SET DEFAULT nextval('public.knowledge_base_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: notification_preferences id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_preferences ALTER COLUMN id SET DEFAULT nextval('public.notification_preferences_id_seq'::regclass);


--
-- Name: preventive_maintenance id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.preventive_maintenance ALTER COLUMN id SET DEFAULT nextval('public.preventive_maintenance_id_seq'::regclass);


--
-- Name: quotes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotes ALTER COLUMN id SET DEFAULT nextval('public.quotes_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: signature_attempts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.signature_attempts ALTER COLUMN id SET DEFAULT nextval('public.signature_attempts_id_seq'::regclass);


--
-- Name: signature_audit_log id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.signature_audit_log ALTER COLUMN id SET DEFAULT nextval('public.signature_audit_log_id_seq'::regclass);


--
-- Name: system_activation id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_activation ALTER COLUMN id SET DEFAULT nextval('public.system_activation_id_seq'::regclass);


--
-- Name: system_settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_settings ALTER COLUMN id SET DEFAULT nextval('public.system_settings_id_seq'::regclass);


--
-- Name: telegram_config id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.telegram_config ALTER COLUMN id SET DEFAULT nextval('public.telegram_config_id_seq'::regclass);


--
-- Name: templates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.templates ALTER COLUMN id SET DEFAULT nextval('public.templates_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: neondb_owner
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
\.


--
-- Data for Name: backup_execution_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.backup_execution_logs (id, schedule_id, status, scheduled_time, executed_at, file_size, error_message, sent_to_telegram, created_at, telegram_message_id, notes) FROM stdin;
1	1	sucesso	2025-12-01 16:48:15.983	2025-12-01 16:48:15.983	451148	\N	f	2025-12-01 16:48:16.002846	\N	\N
2	2	sucesso	2025-12-01 16:51:15.49	2025-12-01 16:51:15.49	451250	\N	f	2025-12-01 16:51:15.50816	\N	\N
3	2	sucesso	2025-12-01 16:52:02.652	2025-12-01 16:52:02.652	451250	\N	f	2025-12-01 16:52:02.669958	\N	\N
4	2	atrasado	2025-12-01 17:03:30.478	2025-12-01 17:03:30.478	451533	\N	f	2025-12-01 17:03:30.496211	\N	\N
5	2	sucesso	2025-12-01 17:06:12.465	2025-12-01 17:06:12.465	451785	\N	f	2025-12-01 17:06:12.483291	\N	\N
6	2	sucesso	2025-12-01 17:10:13.915	2025-12-01 17:10:13.915	451982	\N	f	2025-12-01 17:10:13.933682	\N	\N
7	2	sucesso	2025-12-01 17:10:58.57	2025-12-01 17:10:58.57	452087	\N	f	2025-12-01 17:10:58.588887	\N	\N
8	2	sucesso	2025-12-01 17:16:57.16	2025-12-01 17:16:57.16	452552	\N	f	2025-12-01 17:16:57.178786	\N	\N
9	2	sucesso	2025-12-01 17:29:50.466	2025-12-01 17:29:50.466	451316	\N	t	2025-12-01 17:29:50.485805	\N	\N
10	2	sucesso	2025-12-01 17:36:44.959	2025-12-01 17:36:44.959	451512	\N	t	2025-12-01 17:36:44.978049	\N	\N
11	3	sucesso	2025-12-01 17:56:00.731	2025-12-01 17:56:00.731	451886	\N	t	2025-12-01 17:56:00.748154	\N	\N
12	3	sucesso	2025-12-01 17:56:13.151	2025-12-01 17:56:13.151	452139	\N	t	2025-12-01 17:56:13.17104	\N	\N
13	4	sucesso	2025-12-01 18:09:00.937	2025-12-01 18:09:00.937	452335	\N	t	2025-12-01 18:09:00.955944	\N	\N
14	4	sucesso	2025-12-01 18:09:07.251	2025-12-01 18:09:07.251	452335	\N	t	2025-12-01 18:09:07.269886	\N	\N
15	4	sucesso	2025-12-01 21:45:58.967	2025-12-01 21:45:58.967	461795	\N	t	2025-12-01 21:45:58.986013	\N	\N
16	4	sucesso	2025-12-01 21:50:23.556	2025-12-01 21:50:23.556	460760	\N	t	2025-12-01 21:50:23.573348	\N	\N
17	4	sucesso	2025-12-01 21:54:08.978	2025-12-01 21:54:08.978	460866	\N	t	2025-12-01 21:54:08.996944	\N	\N
18	4	sucesso	2025-12-02 15:50:12.664	2025-12-02 15:50:12.664	474820	\N	t	2025-12-02 15:50:12.674081	\N	\N
19	4	sucesso	2025-12-06 22:48:50.452	2025-12-06 22:48:50.452	490747	\N	t	2025-12-06 22:48:50.469406	\N	\N
20	4	sucesso	2025-12-08 15:50:44.437	2025-12-08 15:50:44.437	490944	\N	t	2025-12-08 15:50:44.455397	\N	\N
21	4	sucesso	2025-12-08 15:50:47.409	2025-12-08 15:50:47.409	490944	\N	t	2025-12-08 15:50:47.428563	\N	\N
22	4	sucesso	2025-12-09 15:51:14.93	2025-12-09 15:51:14.93	494359	\N	t	2025-12-09 15:51:15.146937	\N	\N
23	4	sucesso	2025-12-10 15:50:22.546	2025-12-10 15:50:22.546	503150	\N	t	2025-12-10 15:50:22.860837	\N	\N
24	4	sucesso	2025-12-15 15:51:10.092	2025-12-15 15:51:10.092	526974	\N	t	2025-12-15 15:51:10.509032	\N	\N
25	4	sucesso	2025-12-16 15:50:45.024	2025-12-16 15:50:45.024	538229	\N	t	2025-12-16 15:50:45.041881	\N	\N
26	4	sucesso	2025-12-19 15:50:47.729	2025-12-19 15:50:47.729	547455	\N	t	2025-12-19 15:50:47.748173	\N	\N
27	4	sucesso	2025-12-22 15:51:02.363	2025-12-22 15:51:02.363	560151	\N	t	2025-12-22 15:51:02.380279	\N	\N
28	4	sucesso	2025-12-30 15:50:43.112	2025-12-30 15:50:43.112	566919	\N	t	2025-12-30 15:50:43.130779	\N	\N
29	4	sucesso	2026-01-05 15:50:38.466	2026-01-05 15:50:38.466	578928	\N	t	2026-01-05 15:50:38.483429	\N	\N
30	4	sucesso	2026-01-08 15:51:05.662	2026-01-08 15:51:05.662	584665	\N	t	2026-01-08 15:51:05.783919	\N	\N
31	4	sucesso	2026-01-09 15:50:44.556	2026-01-09 15:50:44.556	587008	\N	t	2026-01-09 15:50:44.574232	\N	\N
32	4	sucesso	2026-01-10 15:50:42.803	2026-01-10 15:50:42.803	587240	\N	t	2026-01-10 15:50:43.019026	\N	\N
33	4	sucesso	2026-01-12 15:51:00.504	2026-01-12 15:51:00.504	588215	\N	t	2026-01-12 15:51:00.821179	\N	\N
34	4	sucesso	2026-01-13 15:50:32.28	2026-01-13 15:50:32.28	595400	\N	t	2026-01-13 15:50:32.49671	\N	\N
35	4	sucesso	2026-01-14 15:50:57.966	2026-01-14 15:50:57.966	606154	\N	t	2026-01-14 15:50:57.982782	\N	\N
36	4	sucesso	2026-01-15 15:50:22.702	2026-01-15 15:50:22.702	610228	\N	t	2026-01-15 15:50:22.719107	\N	\N
\.


--
-- Data for Name: backup_history; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.backup_history (id, filename, file_size, status, created_at, notes, was_scheduled, sent_to_telegram, telegram_message_id) FROM stdin;
41	backup_2025-12-06T22-49-18-752Z.sql	492148	sucesso	2025-12-06 22:49:24.734471	\N	f	f	\N
42	backup_scheduled_2025-12-08T15-50-31-076Z.sql	490944	sucesso	2025-12-08 15:50:50.453604	Backup automático - diario	f	f	\N
43	backup_scheduled_2025-12-08T15-50-31-409Z.sql	490944	sucesso	2025-12-08 15:50:51.726931	Backup automático - diario	f	f	\N
44	backup_scheduled_2025-12-09T15-50-58-869Z.sql	494359	sucesso	2025-12-09 15:51:19.346257	Backup automático - diario	f	f	\N
45	backup_scheduled_2025-12-10T15-50-06-785Z.sql	503150	sucesso	2025-12-10 15:50:27.564242	Backup automático - diario	f	f	\N
46	backup_2025-12-13T18-41-54-906Z.sql	527154	sucesso	2025-12-13 18:42:01.852699	\N	f	f	\N
47	backup_scheduled_2025-12-15T15-50-54-093Z.sql	526974	sucesso	2025-12-15 15:51:15.508343	Backup automático - diario	f	f	\N
48	backup_scheduled_2025-12-16T15-50-29-224Z.sql	538229	sucesso	2025-12-16 15:50:50.641069	Backup automático - diario	f	f	\N
49	backup_scheduled_2025-12-19T15-50-31-729Z.sql	547455	sucesso	2025-12-19 15:50:52.746433	Backup automático - diario	f	f	\N
50	backup_scheduled_2025-12-22T15-50-44-262Z.sql	560151	sucesso	2025-12-22 15:51:08.577418	Backup automático - diario	f	f	\N
51	backup_scheduled_2025-12-30T15-50-26-112Z.sql	566919	sucesso	2025-12-30 15:51:58.626799	Backup automático - diario	f	f	\N
52	backup_scheduled_2026-01-05T15-50-22-666Z.sql	578928	sucesso	2026-01-05 15:50:43.882281	Backup automático - diario	f	f	\N
53	backup_scheduled_2026-01-08T15-50-47-562Z.sql	584665	sucesso	2026-01-08 15:51:12.47779	Backup automático - diario	f	f	\N
54	backup_scheduled_2026-01-09T15-50-26-854Z.sql	587008	sucesso	2026-01-09 15:50:50.312862	Backup automático - diario	f	f	\N
55	backup_scheduled_2026-01-10T15-50-23-203Z.sql	587240	sucesso	2026-01-10 15:50:49.119488	Backup automático - diario	f	f	\N
56	backup_scheduled_2026-01-12T15-50-42-752Z.sql	588215	sucesso	2026-01-12 15:51:06.52195	Backup automático - diario	f	f	\N
57	backup_scheduled_2026-01-13T15-50-13-579Z.sql	595400	sucesso	2026-01-13 15:50:38.496422	Backup automático - diario	f	f	\N
58	backup_scheduled_2026-01-14T15-50-48-667Z.sql	606154	sucesso	2026-01-14 15:51:01.583856	Backup automático - diario	f	f	\N
59	backup_scheduled_2026-01-15T15-50-05-701Z.sql	610228	sucesso	2026-01-15 15:50:27.617649	Backup automático - diario	f	f	\N
\.


--
-- Data for Name: backup_schedules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.backup_schedules (id, user_id, frequency, scheduled_time, timezone, send_to_telegram, is_active, next_execution_at, last_executed_at, created_at, updated_at) FROM stdin;
4	1	diario	15:50	-3	t	t	2025-12-01 17:52:20.156	2026-01-15 15:50:27.506	2025-12-01 17:52:20.387683	2026-01-15 15:50:27.506
\.


--
-- Data for Name: calls; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.calls (id, client_id, equipment, service_type, priority, description, internal_notes, status, progress, created_at, updated_at, user_id, call_date, display_order, created_by_user_id) FROM stdin;
100	134			media	Visita técnica para organização dos equipamentos de rede no hack principal e ajustes na configuração do Mikrotik routerboard	\N	em_andamento	\N	2025-11-22 13:11:05.828764	2025-11-22 13:11:35.35	1	2025-11-21 03:00:00	0	1
33	11	Impressora 	manutencao	media	Retorno George 	\N	em_andamento	\N	2025-06-24 18:22:50.857411	2025-06-24 18:23:02.315	1	2025-08-13 21:36:49.680864	0	1
34	27	CPU 	manutencao	media	Instalas SSD e deixar pronto 	\N	em_andamento	\N	2025-06-24 18:30:32.305643	2025-06-24 18:30:56.637	1	2025-08-13 21:36:49.680864	0	1
35	8	CPU sala 3	manutencao	media	Desvendar mistério sala 3	\N	em_andamento	\N	2025-06-24 18:40:33.298048	2025-06-24 20:34:31.641	1	2025-08-13 21:36:49.680864	0	1
20	8	CPU baixa	formatacao	media	Baixa de imagem 	\N	em_andamento	\N	2025-06-24 01:03:54.136266	2025-06-24 02:25:58.522624	1	2025-08-13 21:36:49.680864	0	1
22	8	Hhhhh	reparo	media	Ok	\N	em_andamento	\N	2025-06-24 02:28:20.067397	2025-06-24 03:39:54.562	1	2025-08-13 21:36:49.680864	0	1
24	9	Impressora grêmio 	manutencao	media	Impressora não puxa papel	\N	faturado	\N	2025-06-24 11:33:46.749479	2025-06-24 11:34:54.705	1	2025-08-13 21:36:49.680864	0	1
36	11	Impressora	manutencao	media	Defeito	\N	em_andamento	\N	2025-06-24 20:56:18.378581	2025-06-24 20:56:56.615	1	2025-08-13 21:36:49.680864	0	1
28	32	Impresso caixa 01	manutencao	media	Levar para garantia com George. Impressora fazendo barulho ao mandar impressão. Impressora na assistência.	\N	em_andamento	\N	2025-06-24 17:21:41.26851	2025-06-24 17:24:58.826	1	2025-08-13 21:36:49.680864	0	1
29	8	Hshshs	manutencao	media	Hshshsh	\N	em_andamento	\N	2025-06-24 17:35:17.199491	2025-06-24 17:46:09.708	1	2025-08-13 21:36:49.680864	0	1
30	11	Hahaha	limpeza	media	Hahahah	\N	em_andamento	\N	2025-06-24 17:50:53.13995	2025-06-24 17:51:05.854	1	2025-08-13 21:36:49.680864	0	1
32	8	Sala 3	manutencao	media	Ajeitar esse carai	\N	em_andamento	\N	2025-06-24 18:11:30.295223	2025-06-24 18:14:00.187	1	2025-08-13 21:36:49.680864	0	1
37	13	teste	manutencao	media	teste	\N	em_andamento	\N	2025-06-24 21:03:59.723709	2025-06-24 21:04:10.036	1	2025-08-13 21:36:49.680864	0	1
39	14	teste teste	manutencao	media	Visita para ajustes	\N	em_andamento	\N	2025-06-24 22:22:22.955873	2025-06-24 22:22:34.447	1	2025-08-13 21:36:49.680864	0	1
40	19	adsdsa	manutencao	media	Relatório por Cliente - ESTE MES	\N	em_andamento	\N	2025-06-24 22:38:25.459	2025-06-25 00:09:20.044	1	2025-08-13 21:36:49.680864	0	1
158	144			media	testes	\N	em_andamento	\N	2025-11-24 19:08:52.829784	2025-11-24 19:09:01.472	1	2025-11-24 19:08:52.809	0	1
159	145			media	testes	\N	em_andamento	\N	2025-11-24 19:25:28.68322	2025-11-24 19:25:38.547	1	2025-11-24 19:25:28.519	0	1
47	8	Impressora	manutencao	media	Quebrou 	\N	em_andamento	\N	2025-06-25 01:33:02.325974	2025-06-25 01:33:42.034	1	2025-08-13 21:36:49.680864	0	1
48	14	DVR	manutencao	media	DVR não está gravando as imagens. Provável problema na fonte de alimentação.	\N	em_andamento	\N	2025-06-25 02:25:22.142952	2025-06-25 02:26:23.364	1	2025-08-13 21:36:49.680864	0	1
49	11	Servidor	manutencao	media	É...	\N	orcamento_criado	\N	2025-06-25 02:34:59.161582	2025-06-25 02:42:45.358	1	2025-08-13 21:36:49.680864	0	1
155	41			media	PC do caixa não liga	\N	em_andamento	\N	2025-11-24 13:06:58.991131	2025-11-24 20:22:29.154	1	2025-11-24 13:06:56.493	0	1
105	28			media	Obra medical center. \nDesmontagem e passagem dos novos cabos para efetuar obra. Remontagem de equipamentos após obra. \n\nSó falta agora colocar as 4 câmeras pra funcionar. \n\nFoi usado 200 metros de cabo. 2 canaletas. \n4 câmeras recepção e faixada.	\N	em_andamento	\N	2025-11-22 15:26:35.276037	2025-11-24 20:23:04.701	5	2025-11-20 03:00:00	0	1
145	140			media	Pegar impressora Epson para fazer manutenção.	\N	em_andamento	\N	2025-11-23 23:40:53.884549	2025-11-25 03:22:20.468	9	2025-11-23 23:40:53.725	0	1
52	8	Estabilizador 	manutencao	media	Barulho	\N	em_andamento	\N	2025-06-25 02:55:56.113766	2025-06-25 03:01:50.574	1	2025-08-13 21:36:49.680864	0	1
107	56			media	Internet portão de eventos	\N	em_andamento	\N	2025-11-22 15:28:00.928531	2025-11-25 03:23:09.917	9	2025-11-04 03:00:00	0	1
104	133			media	Pegar máquina para analisar	\N	aguardando	\N	2025-11-22 15:26:00.663844	2025-11-29 10:13:53.107	1	2025-11-12 03:00:00	0	9
156	143			media	Verificar impressora. Shopping Oitava Mall	\N	em_andamento	\N	2025-11-24 13:56:08.7804	2025-11-26 13:16:50.774	9	2025-11-24 13:56:08.622	0	9
60	31	T	limpeza	media	Teste Albano 2	\N	em_andamento	\N	2025-06-25 03:39:03.768288	2025-06-25 03:39:38.916	1	2025-08-13 21:36:49.680864	0	1
61	16	Troca de fonte	servico	media	Queimou	\N	em_andamento	\N	2025-06-25 03:40:16.044393	2025-06-25 03:40:41.996	1	2025-08-13 21:36:49.680864	0	1
65	14		geral	media	Dvr	\N	em_andamento	\N	2025-06-25 04:14:44.516793	2025-06-25 04:24:38.684	1	2025-08-13 21:36:49.680864	0	1
64	9		geral	media	Jjjjjjj	\N	em_andamento	\N	2025-06-25 04:11:45.270964	2025-06-26 05:18:02.038	1	2025-08-13 21:36:49.680864	0	1
67	8		geral	urgente	Problema recorrente na sala 3. Erro ao mandar impressão.	\N	faturado	\N	2025-06-25 23:43:12.902279	2025-06-25 23:48:21.496	1	2025-08-13 21:36:49.680864	0	1
68	34		geral	baixa	Revisão no sistema de câmeras completo	\N	faturado	\N	2025-06-25 23:46:52.328703	2025-06-26 04:37:21.117	1	2025-08-13 21:36:49.680864	0	1
70	9		geral	media	Só testando descrição do chamado	\N	em_andamento	\N	2025-06-26 18:42:13.655967	2025-06-26 18:43:02.238	1	2025-08-13 21:36:49.680864	0	1
72	16		geral	media	asdasdas	\N	em_andamento	\N	2025-06-26 20:39:12.830874	2025-06-26 20:40:46.805	1	2025-08-13 21:36:49.680864	0	1
74	14		geral	media	DVR Sem gravar	\N	em_andamento	\N	2025-06-26 23:53:44.651475	2025-06-26 23:53:57.377	1	2025-08-13 21:36:49.680864	0	1
75	29		geral	media	Configuração impressora recepção.	\N	em_andamento	\N	2025-06-27 02:51:36.010761	2025-06-27 02:53:11.355	1	2025-08-13 21:36:49.680864	0	1
77	19		geral	media	CPU lenta	\N	em_andamento	\N	2025-06-27 10:33:47.910032	2025-06-27 10:34:20.309	1	2025-08-13 21:36:49.680864	0	1
81	17		geral	media	Baixa de imagem + ssd 128gb e memória RAM 8GB. 	\N	em_andamento	\N	2025-06-27 18:41:38.328853	2025-06-27 18:42:57.249	1	2025-08-13 21:36:49.680864	0	1
1	19		geral	media	Chamado teste	\N	em_andamento	\N	2025-06-30 12:10:48.589577	2025-06-30 12:21:42.575	1	2025-08-13 21:36:49.680864	0	1
83	19		geral	media	Problemas na internet 	\N	em_andamento	\N	2025-06-27 23:23:22.113067	2025-06-27 23:23:52.338	1	2025-08-13 21:36:49.680864	0	1
13	5		geral	media	Visita técnica para passagem de cabo para colocar Pc em rede. 	\N	em_andamento	\N	2025-07-04 12:51:40.516164	2025-07-08 23:44:35.157	1	2025-08-13 21:36:49.680864	0	1
80	34		geral	media	Revisão sistema de câmeras completo Data a combinar.	\N	faturado	\N	2025-06-27 18:33:50.170569	2025-06-28 01:31:48.975	1	2025-08-13 21:36:49.680864	0	1
82	21		geral	baixa	Implantar load balance ou Mikrotik para fazer failover com dois links na rede	\N	faturado	\N	2025-06-27 18:59:33.117406	2025-06-28 01:33:45.055	1	2025-08-13 21:36:49.680864	0	1
87	25		geral	media	teste	\N	em_andamento	\N	2025-06-28 14:11:56.929774	2025-06-28 14:12:05.942	1	2025-08-13 21:36:49.680864	0	1
31	56		geral	baixa	Manutenção preventiva na rede wi-fi do hotel	\N	aguardando	\N	2025-07-09 00:12:03.542868	2025-07-30 17:40:21.316	1	2025-08-13 21:36:49.680864	0	1
88	62		geral	media	Ir até a pousada para fazer a instalação de acess points e ajustes no sistema de câmeras 	\N	em_andamento	\N	2025-06-29 00:32:41.182845	2025-07-03 11:20:19.752	1	2025-08-13 21:36:49.680864	0	1
86	14		geral	media	02/07/2025 DVR não está gravando	\N	em_andamento	\N	2025-06-28 03:14:09.962771	2025-07-03 11:20:44.781	1	2025-08-13 21:36:49.680864	0	1
4	3		geral	media	Notebook Sony Vaio – Substituição do teclado e reparo na carcaça. Serviço + peça.	\N	em_andamento	\N	2025-07-03 11:52:51.476429	2025-08-03 11:51:27.81	1	2025-08-13 21:36:49.680864	0	1
5	56		geral	media	04/07 - SSD e baixa no Pc da contabilidade. 	\N	em_andamento	\N	2025-07-03 11:57:47.677446	2025-07-08 23:44:43.116	1	2025-08-13 21:36:49.680864	0	1
23	12		geral	media	Pc não consegue conectar na rede.n	\N	em_andamento	\N	2025-07-07 13:00:41.253771	2025-07-08 23:44:58.986	1	2025-08-13 21:36:49.680864	0	1
2	26		geral	media	02/07/2025 - Passar lá na clínica para pegar HD externo para análise. Parece que o disco está com problemas físicos.	\N	em_andamento	\N	2025-07-01 22:57:02.685378	2025-07-04 11:07:24.089	1	2025-08-13 21:36:49.680864	0	1
7	4		geral	media	04/07 - Problema impressora da recepção. Colocamos a da cozinha na recepção. RETORNO IMP PAROU NOVAMENTE. 	\N	em_andamento	\N	2025-07-03 20:04:18.908103	2025-08-01 17:45:58.241	1	2025-08-13 21:36:49.680864	0	1
11	54		geral	alta	CPU não está ligando	\N	em_andamento	\N	2025-07-04 11:05:32.245856	2025-07-04 18:02:21.404	1	2025-08-13 21:36:49.680864	0	1
9	33		geral	alta	Visita para ver impressora que ficou devagar quase parando	\N	em_andamento	\N	2025-07-03 20:34:51.773362	2025-07-04 18:02:25.983	1	2025-08-13 21:36:49.680864	0	1
6	28		geral	media	03/07 visita técnica Pedro velho para verificar DVR. 	\N	em_andamento	\N	2025-07-03 19:45:20.184107	2025-07-04 18:02:32.964	1	2025-08-13 21:36:49.680864	0	1
111	114			baixa	Orçamento serviço da fazenda	\N	aguardando	\N	2025-11-22 15:30:28.34177	2025-11-26 03:27:43.373	1	2025-09-30 03:00:00	0	9
25	15		geral	media	Visita técnica para colocar impressoras em rede no espaço novo. 	\N	em_andamento	\N	2025-07-07 14:09:05.303093	2025-07-08 12:05:47.792	1	2025-08-13 21:36:49.680864	0	1
19	10		geral	media	Buscar Pc para fazer geral. 	\N	em_andamento	\N	2025-07-07 11:29:06.663914	2025-07-08 12:07:36.424	1	2025-08-13 21:36:49.680864	0	1
17	8		geral	media	Configurar DICOM nas duas ultrassom Philips. Após manutenção do técnico perdeu a configuração. 	\N	em_andamento	\N	2025-07-05 17:54:50.106091	2025-07-08 12:09:12.575	1	2025-08-13 21:36:49.680864	0	1
16	11		geral	media	Visita para ver CPU direção. Levar dois orçamentos para concluirmos a nota que foi enviada pra eles por último.	\N	em_andamento	\N	2025-07-04 18:03:13.466356	2025-07-08 23:44:26.647	1	2025-08-13 21:36:49.680864	0	1
8	37		geral	media	Visita técnica para verificar nobreak.	\N	em_andamento	\N	2025-07-03 20:18:26.978538	2025-07-09 00:08:19.419	1	2025-08-13 21:36:49.680864	0	1
174	\N			media		\N	aguardando	\N	2025-11-25 03:20:58.107126	2025-11-25 03:20:58.107126	9	2025-11-25 03:20:57.914	0	1
108	122			media	Problema mouse para e upgrade de memória	\N	em_andamento	\N	2025-11-22 15:28:57.623357	2025-11-24 16:51:50.182	5	2025-10-27 03:00:00	0	1
42	64		geral	media	Estabilizador com George para análise. 1000 VA quadrado parecido com os da Odete.	\N	em_andamento	\N	2025-07-10 00:55:55.244271	2025-07-10 02:28:51.249	1	2025-08-13 21:36:49.680864	0	1
18	62		geral	media	Pegar impressora na logos e comprar cabos de áudio RCA/P2. 	\N	em_andamento	\N	2025-07-05 17:56:21.297425	2025-07-10 02:32:12.905	1	2025-08-13 21:36:49.680864	0	1
46	8		geral	media	Monitor pra o teleatendimento. 	\N	em_andamento	\N	2025-07-10 13:47:07.205918	2025-07-10 19:10:11.413	1	2025-08-13 21:36:49.680864	0	1
45	10		geral	media	Deixar Pc 	\N	em_andamento	\N	2025-07-10 13:45:14.032638	2025-07-10 19:13:01.615	1	2025-08-13 21:36:49.680864	0	1
50	67		geral	media	Pegar impressora em George pra entregar. Verificar Pc Alcilene.	\N	em_andamento	\N	2025-07-10 13:49:31.655647	2025-07-11 13:29:19.118	1	2025-08-13 21:36:49.680864	0	1
41	9		geral	media	Instalar chromebook na supervisão. 	\N	em_andamento	\N	2025-07-09 12:00:26.566968	2025-07-14 12:35:58.291	1	2025-08-13 21:36:49.680864	0	1
43	65		geral	media	Máquina não dá vídeo. Kelvin já analisou mas constatou que é a placa mãe. Levar pra JCA. 	\N	em_andamento	\N	2025-07-10 12:07:49.456649	2025-07-14 12:36:11.262	1	2025-08-13 21:36:49.680864	0	1
44	66		geral	media	Máquina liga sem vídeo. Kelvin analisou e viu que o problema é placa de vídeo. Levar placa pra JCA Analisar. 	\N	em_andamento	\N	2025-07-10 12:08:30.494824	2025-07-14 12:36:13.198	1	2025-08-13 21:36:49.680864	0	1
21	56		geral	media	Roteador Portão de eventos.	\N	em_andamento	\N	2025-07-07 12:12:52.111489	2025-07-14 12:36:25.62	1	2025-08-13 21:36:49.680864	0	1
53	70		geral	media	Serviço de manutenção e melhoria na infraestrutura de rede.	\N	em_andamento	\N	2025-07-14 17:34:28.942911	2025-07-14 17:34:33.642	1	2025-08-13 21:36:49.680864	0	1
55	55		geral	media	Verificar Pc que não liga	\N	em_andamento	\N	2025-07-16 17:10:26.870257	2025-07-17 18:30:39.122	1	2025-08-13 21:36:49.680864	0	1
54	8		geral	media	Configurar acesso externo DVR novo	\N	em_andamento	\N	2025-07-15 12:12:30.493181	2025-07-17 20:33:40.745	1	2025-08-13 21:36:49.680864	0	1
62	28		geral	media	Roteador recepção João da Escóssia	\N	em_andamento	\N	2025-07-17 20:34:26.666158	2025-07-17 20:34:31.348	1	2025-08-13 21:36:49.680864	0	1
63	28		geral	media	Desktop recepção. CPU + Monitor. 	\N	em_andamento	\N	2025-07-17 20:35:23.861985	2025-07-17 20:35:32.568	1	2025-08-13 21:36:49.680864	0	1
14	7		geral	media	10/07 Ir concluir. Já foi instalado todo o sistema. Agora ajustar detalhes e concluir serviço. Cobrar serviço, DVR, câmera. 	\N	em_andamento	\N	2025-07-04 14:13:26.74491	2025-07-18 11:10:50.058	1	2025-08-13 21:36:49.680864	0	1
58	75		geral	media	CPU travou e ficou chuviscando a tela	\N	em_andamento	\N	2025-07-17 18:29:46.981717	2025-07-18 19:08:16.456	1	2025-08-13 21:36:49.680864	0	1
199	\N			media		\N	aguardando	\N	2025-11-26 13:14:01.416044	2025-11-26 13:14:01.416044	9	2025-11-26 13:13:59.258	0	1
66	8		geral	media	Visita técnica cortesia	\N	em_andamento	\N	2025-07-19 17:28:59.233002	2025-07-19 17:29:05.878	1	2025-08-13 21:36:49.680864	0	1
51	28		geral	media	Limpezas das máquinas das 3 lojas. 	\N	em_andamento	\N	2025-07-10 14:31:08.602565	2025-07-19 17:31:33.168	1	2025-08-13 21:36:49.680864	0	1
102	136			alta	Revisão no sistema de câmeras e ajustes no sistema de som	\N	em_andamento	\N	2025-11-22 14:32:19.115468	2025-11-25 03:22:04.5	1	2025-11-19 03:00:00	0	1
57	56		geral	media	Pegar note verônica para colocar SSD. 	\N	em_andamento	\N	2025-07-17 18:05:29.666433	2025-07-21 15:15:14.354	1	2025-08-13 21:36:49.680864	0	1
56	73		geral	media	Máquina com ssd cheio. 	\N	em_andamento	\N	2025-07-17 14:13:58.177394	2025-07-21 15:15:17.74	1	2025-08-13 21:36:49.680864	0	1
69	8		geral	media	Visita técnica cortesia para resolver alguns detalhes. Retorno Pc Rayane Wpp, colocamos coringa e o Pc trouxemos para analisar. Troca da impressora sala 3. Ajuste placa de vídeo rosado. 	\N	em_andamento	\N	2025-07-19 17:34:24.059733	2025-07-19 17:34:29.335	1	2025-08-13 21:36:49.680864	0	1
71	8		geral	media	Visita técnica cortesia para resolver alguns detalhes. Retorno Pc Rayane Wpp, colocamos coringa e o Pc trouxemos para analisar. Troca da impressora sala 3. Ajuste placa de vídeo rosado.	\N	em_andamento	\N	2025-07-19 17:35:21.631864	2025-07-19 17:35:28.015	1	2025-08-13 21:36:49.680864	0	1
73	37		geral	media	Acesso remoto com Nayara, cópia dos arquivos. 	\N	em_andamento	\N	2025-07-19 17:38:02.630556	2025-07-19 17:38:08.749	1	2025-08-13 21:36:49.680864	0	1
76	56		geral	media	16/07 Acesso remoto e contato com o suporte da Locaweb para resolver problema nos emails apos intervenção do pessoal da agência no site. 	\N	em_andamento	\N	2025-07-21 16:53:31.892442	2025-07-21 16:53:45.735	1	2025-08-13 21:36:49.680864	0	1
200	150			media	Instalação do sistema operacional máquina nova.	\N	em_andamento	\N	2025-11-26 13:14:48.685078	2025-11-27 13:45:14.355	9	2025-11-26 13:14:46.522	0	9
176	56			media	Desktop Adryelle com barulho. Fazer limpeza. 	\N	em_andamento	\N	2025-11-25 12:55:35.945096	2025-11-27 13:45:26.453	9	2025-11-25 12:55:33.735	0	9
89	11		geral	media	Ver câmeras do setor de corte. 22/07	\N	em_andamento	\N	2025-07-22 12:51:04.68135	2025-07-24 06:36:35.172	1	2025-08-13 21:36:49.680864	0	1
79	77		geral	media	Pc na tela de BIOS. Garantia do serviço.	\N	em_andamento	\N	2025-07-22 12:15:12.585018	2025-07-24 06:36:45.797	1	2025-08-13 21:36:49.680864	0	1
90	37		geral	media	Porgel Bahia.	\N	em_andamento	\N	2025-07-24 11:22:16.81135	2025-07-24 11:22:29.851	1	2025-08-13 21:36:49.680864	0	1
91	28		geral	media	Visita técnica para resolver Desktop laboratório que ficou com erro de rede apos atualização. 	\N	em_andamento	\N	2025-07-24 11:29:35.875782	2025-07-24 11:29:42.241	1	2025-08-13 21:36:49.680864	0	1
92	28		geral	media	Parcelamentos das limpeza das máquinas e computador farmacêutico recepção. 	\N	em_andamento	\N	2025-07-24 11:36:07.741282	2025-07-24 11:36:14.305	1	2025-08-13 21:36:49.680864	0	1
93	78		geral	media	Notebook não da imagem corretamente	\N	em_andamento	\N	2025-07-25 16:48:50.3252	2025-07-25 16:48:55.278	1	2025-08-13 21:36:49.680864	0	1
94	28		geral	media	Serviço das câmeras Pedro Velho. 	\N	em_andamento	\N	2025-07-28 13:44:27.131503	2025-07-28 13:45:57.595	1	2025-08-13 21:36:49.680864	0	1
78	74		geral	media	Retorno Pc. Pegar lá na aduern hoje dia 22. Pela manhã.	\N	em_andamento	\N	2025-07-22 12:13:45.143643	2025-07-28 14:05:48.224	1	2025-08-13 21:36:49.680864	0	1
109	67			media	Pc depósito reiniciando sozinho	\N	em_andamento	\N	2025-11-22 15:29:29.591818	2025-11-25 02:54:45.333	9	2025-10-29 03:00:00	0	1
153	67			urgente	Verificar máquina de Wigno depósito	\N	em_andamento	\N	2025-11-24 12:11:53.217672	2025-11-25 03:14:02.252	9	2025-11-24 12:11:53.071	0	1
157	11			media	teadsadsadsadsadsadsa	\N	em_andamento	\N	2025-11-24 14:23:57.600343	2025-11-24 14:24:04.84	1	2025-11-24 14:23:55.066	0	1
160	146			media	sadsaddadaasdasdsa	\N	em_andamento	\N	2025-11-24 19:31:22.096042	2025-11-24 19:31:28.404	1	2025-11-24 19:31:22.077	0	1
154	26			media	Visita técnica para fazer instalação de roteador principal e ajustes na rede, garantindo que todos os computadores da clínica tenham internet e acesso ao sistema Doctors	\N	em_andamento	\N	2025-11-24 13:03:24.372137	2025-11-24 20:16:26.548	1	2025-11-24 13:03:24.189	0	1
206	60		Ativação Windows	media	Ativação Windows 10	\N	em_andamento	\N	2025-11-27 15:28:33.630618	2025-11-27 15:28:48.72	1	2025-11-27 15:28:33.481	0	1
203	143			media	Pegar note pra fazer upgrade	\N	em_andamento	\N	2025-11-26 16:09:35.288695	2025-11-28 00:47:04.698	1	2025-11-26 16:09:35.141	0	1
201	56			media	Impressora escritórios. Trocar cilindro. 	\N	em_andamento	\N	2025-11-26 13:37:39.663159	2025-11-28 12:56:03.674	9	2025-11-26 13:37:39.512	0	9
183	149			media		\N	aguardando	\N	2025-11-25 14:00:06.143197	2025-11-25 14:00:06.143197	7	2025-11-24 03:00:00	0	1
184	149		Reparo em CPU 	media	Computador parou de ligar	\N	em_andamento	\N	2025-11-25 14:11:54.208974	2025-11-25 14:12:17.152	7	2025-11-25 14:11:52.056	0	1
207	63			media	Teste	\N	em_andamento	\N	2025-11-28 20:33:46.99497	2025-11-28 20:33:56.864	9	2025-11-28 20:33:46.837	0	1
208	64			media	Tetstets	\N	em_andamento	\N	2025-11-28 20:34:48.793794	2025-11-28 20:35:05.789	1	2025-11-28 20:34:48.775	0	1
209	65			media	testesfsadsadsadsada	\N	em_andamento	\N	2025-11-28 20:45:16.103068	2025-11-28 20:45:31.736	7	2025-11-28 20:45:15.938	0	1
210	64			media	sdadsaassdasdasasdasda	\N	em_andamento	\N	2025-11-28 20:51:07.563233	2025-11-28 20:51:16.994	7	2025-11-28 20:51:07.396	0	1
216	64			media	Ksjdjhdhdhsjsjjsjsj	\N	em_andamento	\N	2025-11-28 23:12:11.002321	2025-11-28 23:12:50.425	1	2025-11-28 23:12:10.841	0	10
213	64			media	sdasdasdasdasdasdaasdsdaasd	\N	em_andamento	\N	2025-11-28 21:06:11.234354	2025-11-28 21:06:30.036	7	2025-11-28 21:06:11.065	0	7
219	64			media	sadsadasdasdasdas	\N	em_andamento	\N	2025-11-30 02:01:11.992784	2025-11-30 02:01:19.82	1	2025-11-30 02:01:11.972	0	1
211	65			media	sadsadsadsadsadsada	\N	em_andamento	\N	2025-11-28 20:53:39.174753	2025-11-28 20:53:49.802	7	2025-11-28 20:53:39.007	0	1
214	64			media	sdaassdasdasdasdasdasdasdaasdasdsdasda	\N	em_andamento	\N	2025-11-28 21:16:20.703584	2025-11-28 21:16:38.214	7	2025-11-28 21:16:18.527	0	7
185	14			media	Monitor Dell 19" Jacinta	\N	em_andamento	\N	2025-11-25 16:11:59.888085	2025-11-26 19:07:47.837	1	2025-11-26 03:00:00	0	1
212	64			media	sadsaddsdaasdsadsadsadsadsadsadsadsadsad	\N	em_andamento	\N	2025-11-28 20:56:10.037328	2025-11-28 20:56:41.053	7	2025-11-28 20:56:09.87	0	7
215	64			media	jfgghfdhgfdhgfd	\N	em_andamento	\N	2025-11-28 21:21:20.611982	2025-11-28 21:21:32.275	7	2025-11-28 21:21:20.42	0	7
218	64			media	Ucufudufufufufufufufff	\N	em_andamento	\N	2025-11-29 10:57:17.374551	2025-11-29 10:57:46.917	1	2025-11-29 10:57:17.217	0	7
217	64			media	Ksjdjsjsjs	\N	em_andamento	\N	2025-11-29 10:10:18.380538	2025-11-29 10:10:51.057	1	2025-11-29 10:10:18.21	0	1
220	62		Manutenção Notebook Samsung	media	Trocar Dcjack e carregador. Reconstrução na carcaça e manutenção das dobradiças. 	\N	em_andamento	\N	2025-12-01 18:26:29.09926	2025-12-01 18:29:40.076	9	2025-12-01 18:26:28.822	0	9
222	\N			media		\N	aguardando	\N	2025-12-01 20:25:48.84749	2025-12-01 20:25:48.84749	9	2025-12-01 20:25:48.562	0	9
224	\N			media		\N	aguardando	\N	2025-12-01 20:27:14.634046	2025-12-01 20:27:14.634046	1	2025-12-01 20:27:14.364	0	1
225	\N			media		\N	aguardando	\N	2025-12-01 20:27:35.139987	2025-12-01 20:27:35.139987	9	2025-12-01 20:27:35.121	0	9
227	\N			media		\N	aguardando	\N	2025-12-01 20:43:58.021816	2025-12-01 20:43:58.021816	1	2025-12-01 20:43:57.797	0	1
228	\N			media		\N	aguardando	\N	2025-12-01 20:47:50.844593	2025-12-01 20:47:50.844593	1	2025-12-01 20:47:50.545	0	1
229	\N			media		\N	aguardando	\N	2025-12-01 21:00:37.852088	2025-12-01 21:00:37.852088	1	2025-12-01 21:00:37.564	0	1
230	\N			media		\N	aguardando	\N	2025-12-01 21:11:09.621002	2025-12-01 21:11:09.621002	1	2025-12-01 21:11:09.339	0	1
231	\N			media		\N	aguardando	\N	2025-12-01 21:15:29.520702	2025-12-01 21:15:29.520702	1	2025-12-01 21:15:29.243	0	1
232	\N			media		\N	aguardando	\N	2025-12-01 21:15:59.93533	2025-12-01 21:15:59.93533	1	2025-12-01 21:15:59.666	0	1
233	\N			media		\N	aguardando	\N	2025-12-01 21:18:43.172033	2025-12-01 21:18:43.172033	1	2025-12-01 21:18:42.843	0	1
234	\N			media		\N	aguardando	\N	2025-12-01 21:20:28.124329	2025-12-01 21:20:28.124329	1	2025-12-01 21:20:27.821	0	1
235	\N			media		\N	aguardando	\N	2025-12-01 21:27:11.5316	2025-12-01 21:27:11.5316	1	2025-12-01 21:27:11.276	0	1
177	56			alta	Máquina de Célia com pouca memória. 	\N	em_andamento	\N	2025-11-25 12:57:04.214973	2025-12-02 12:20:09.393	9	2025-11-25 12:57:04.05	0	9
223	151			media	Acesso remoto para instalar pacote office.	\N	em_andamento	\N	2025-12-01 20:26:43.052653	2025-12-02 12:20:53.995	9	2025-12-01 20:26:43.032	0	9
226	153			media	Acesso remoto para configurar impressora.	\N	em_andamento	\N	2025-12-01 20:28:11.528937	2025-12-02 12:20:59.981	9	2025-12-01 20:28:11.261	0	9
221	26			media	Fonte ATX queimada	\N	em_andamento	\N	2025-12-01 18:27:08.655597	2025-12-02 15:52:42.42	1	2025-12-02 03:00:00	0	1
245	94			media	Verificar HDTV em chinês deixar em português.	\N	em_andamento	\N	2025-12-03 12:29:21.499586	2025-12-13 02:46:22.27	9	2025-12-03 12:29:21.219	0	9
240	41			media	Computador balcão do canto está se desligando e muito lento, travando. Impressora HP dando erro no toner. HP p1102w.	\N	em_andamento	\N	2025-12-02 12:24:53.680489	2025-12-10 22:21:13.37	1	2025-12-10 03:00:00	0	1
241	84			media	Pc Rose recepção ficando sem conexão. 	\N	em_andamento	\N	2025-12-02 12:25:44.369819	2025-12-13 02:46:28.052	9	2025-12-02 12:25:44.096	0	9
238	62			media	Visita técnica para ajustar o som e as antenas. 	\N	em_andamento	\N	2025-12-02 12:14:00.606322	2025-12-13 02:47:05.079	9	2025-12-02 12:14:00.332	0	9
249	167			media	Orçamento passagem do cabo 	\N	em_andamento	\N	2025-12-04 16:32:16.546332	2025-12-05 14:08:48.049	9	2025-12-04 16:32:16.527	0	9
255	22		Sistema gdoor com problemas	media	Provável problema na rede ou no servidor	\N	aguardando	\N	2025-12-09 12:34:44.86057	2025-12-09 12:34:44.86057	1	2025-12-09 12:34:44.58	0	1
256	171			media		\N	aguardando	\N	2025-12-09 14:05:19.099047	2025-12-09 14:05:19.099047	9	2025-12-09 14:05:19.079	0	9
258	14			media	PC Janaíne parou de funcionar após queda de energia	\N	em_andamento	\N	2025-12-10 17:19:36.00875	2025-12-10 17:19:44.885	1	2025-12-10 17:19:35.735	0	1
259	41			alta	Manutenção PC de Elenilza.\nManutenção impressora Brother (ver uma outra para colocar no local)\nInstalação nobreak no balcão de atendimento.\nLevar estabilizador para Pc do carrinho.\nLevar cabo VGA para Pc do carrinho.	\N	aguardando	\N	2025-12-10 22:19:54.311879	2025-12-10 22:19:54.311879	1	2025-12-10 22:19:54.043	0	1
260	172			media	CPU gamer liga mas não dá vídeo	\N	em_andamento	\N	2025-12-11 20:55:54.554989	2025-12-11 20:56:03.129	1	2025-12-11 20:55:54.286	0	1
257	171			media	Fonte ATX, Fonte IMP cupom, Roteador W6.\n\nBackup e baixa Pc. 	\N	em_andamento	\N	2025-12-09 14:07:28.717262	2025-12-13 01:44:40.9	9	2025-12-09 14:07:28.445	0	9
251	169			media	Notebook e inpraora pra verificar. 	\N	em_andamento	\N	2025-12-05 13:26:10.960145	2025-12-13 02:47:13.455	9	2025-12-05 13:26:10.694	0	9
274	175			media	Problemas rede cabeada. Levar um Switch. 	\N	em_andamento	\N	2025-12-23 11:56:12.044773	2025-12-26 19:17:02.417	9	2025-12-23 11:56:11.747	0	9
250	168			media	Pegar note na Jacaúna	\N	em_andamento	\N	2025-12-05 13:14:31.924624	2025-12-15 16:43:11.724	9	2025-12-05 13:14:31.643	0	9
266	28			media	Fonte ATX e adaptador wifiusb	\N	em_andamento	\N	2025-12-15 23:22:36.426837	2025-12-16 15:39:13.883	9	2025-12-15 23:22:36.163	0	9
261	28			media	Resolução telefones.	\N	em_andamento	\N	2025-12-13 22:05:45.692344	2025-12-16 15:44:50.596	9	2025-12-13 22:05:45.423	0	9
262	28			media	Ajustes das câmeras e configuração de tela remota DVR HBtech diretoria. 	\N	em_andamento	\N	2025-12-15 13:03:14.575309	2025-12-16 15:44:55.448	9	2025-12-15 13:03:14.302	0	9
268	175			media	Manutenção servidor loja santo Antônio	\N	em_andamento	\N	2025-12-20 13:53:44.565253	2025-12-22 11:30:25.012	9	2025-12-20 13:53:44.262	0	9
272	4			media	Ver câmera recepção	\N	aguardando	\N	2025-12-22 14:45:25.477555	2025-12-22 14:45:25.477555	9	2025-12-22 14:45:25.203	0	9
269	24			media	Note de Kew não liga. 	\N	em_andamento	\N	2025-12-20 13:54:03.045326	2025-12-26 19:23:04.34	9	2025-12-20 13:54:03.026	0	9
288	9			media	Bomba Dagua. 	\N	aguardando	\N	2026-01-08 00:06:41.320449	2026-01-08 00:06:41.320449	9	2026-01-08 00:06:41.051	0	9
296	83			media	Ajustes nas impressoras Canon	\N	aguardando	\N	2026-01-14 22:02:04.365856	2026-01-14 22:02:04.365856	1	2026-01-14 22:02:04.092	0	1
247	166			media	Verificar Pc no apartamento Mossoró	\N	aguardando	\N	2025-12-03 13:18:51.924107	2025-12-26 19:28:19.619	9	2025-12-03 13:18:51.659	0	9
278	177			media		\N	aguardando	\N	2025-12-29 18:05:58.270099	2025-12-29 18:05:58.270099	9	2025-12-29 18:05:58.251	0	9
276	176			media	Verificar notebook 	\N	em_andamento	\N	2025-12-26 19:26:51.923285	2026-01-03 15:11:57.187	9	2025-12-26 19:26:51.657	0	9
281	178			media	Aluguel de máquinas Tibau. 	\N	em_andamento	\N	2025-12-30 20:06:16.742637	2026-01-04 00:10:57.622	9	2025-12-30 20:06:16.722	0	9
279	25			media	Verificar notebook.  	\N	em_andamento	\N	2025-12-30 14:32:25.909655	2026-01-04 00:13:21.091	9	2025-12-30 14:32:25.631	0	9
253	24			media	Note Kew tá com Claudinho pra adapta botão. 	\N	em_andamento	\N	2025-12-05 20:58:43.261905	2026-01-04 00:13:35.513	9	2025-12-05 20:58:42.994	0	9
273	31			media	Manutenção nos três computadores do escritório	\N	em_andamento	\N	2025-12-22 19:48:35.592938	2026-01-04 00:13:42.493	9	2025-12-22 19:48:35.31	0	1
267	173			alta	Visita técnica para verificar instalação da infra do apartamento novo. 	\N	aguardando	\N	2025-12-18 20:18:30.191745	2026-01-04 00:14:42.55	9	2025-12-18 20:18:29.922	0	9
264	8			media	Problema wpp	\N	em_andamento	\N	2025-12-15 13:04:07.445133	2026-01-04 00:14:56.239	9	2025-12-15 13:04:07.191	0	9
282	142			media	Verificar tv box	\N	aguardando	\N	2026-01-05 12:08:48.553918	2026-01-05 12:08:48.553918	9	2026-01-05 12:08:46.286	0	9
280	94			media	Deixar HDTV	\N	em_andamento	\N	2025-12-30 14:44:05.871284	2026-01-05 12:09:42.113	9	2025-12-30 14:44:05.853	0	9
284	36			media	Problema impressora colorida. Pegar pra tentar resolver.  E se tiver uma pra levar pra alugar. 	\N	aguardando	\N	2026-01-05 12:10:49.205826	2026-01-05 12:10:49.205826	9	2026-01-05 12:10:49.188	0	9
283	28			media	Nobreak recepção e do servidor João da escooasia	\N	aguardando	\N	2026-01-05 12:10:14.269672	2026-01-05 13:03:14.24	9	2026-01-05 12:10:14.008	0	9
297	\N			media	Pegar 3 note pra analisar. 	\N	aguardando	\N	2026-01-15 12:55:17.844189	2026-01-15 12:55:17.844189	9	2026-01-15 12:55:17.568	0	9
286	3			media	Pegar note pra analisar. 	\N	em_andamento	\N	2026-01-07 12:28:24.87152	2026-01-09 13:31:24.76	9	2026-01-07 12:28:24.604	0	9
291	109			media	Impressora Epson imprimindo em branco	\N	em_andamento	\N	2026-01-09 13:13:46.804951	2026-01-12 12:45:46.57	1	2026-01-09 13:13:46.532	0	1
292	180			media	Nobreak apitando lá na jangada veículos	\N	aguardando	\N	2026-01-13 11:36:08.642675	2026-01-13 11:36:08.642675	1	2026-01-13 11:36:08.345	0	1
290	179			media	Pegar note para fazer baixa. \nRua Rolô Eufrásio, 29, abolição 3.\nRua por trás da Igreja São Francisco	\N	em_andamento	\N	2026-01-09 11:08:28.129802	2026-01-13 18:39:00.424	9	2026-01-09 11:08:27.757	0	9
277	101			media	Pegar nobreak	\N	em_andamento	\N	2025-12-26 19:27:58.636792	2026-01-13 18:56:40.213	9	2025-12-26 19:27:58.619	0	9
293	8			media	Verificar Pc do teleatendimento. 	\N	aguardando	\N	2026-01-13 23:47:34.112566	2026-01-13 23:47:34.112566	9	2026-01-13 23:47:33.842	0	9
285	8			alta	Verificar  problema no computador Gustavo Rosada, que não está ligando.	\N	em_andamento	\N	2026-01-06 21:47:43.251388	2026-01-14 11:17:51.573	9	2026-01-06 21:47:43.229	0	7
294	28			media	Medical center  Pc não liga. 	\N	aguardando	\N	2026-01-14 13:04:37.611577	2026-01-14 13:04:37.611577	9	2026-01-14 13:04:37.339	0	9
295	181			media	Verificar emails e lentidão no Pc. 	\N	aguardando	\N	2026-01-14 14:23:39.547899	2026-01-14 14:23:39.547899	9	2026-01-14 14:23:39.265	0	9
300	25			media	Acesso remoto confirmar impressora. 	\N	aguardando	\N	2026-01-16 13:15:01.059179	2026-01-16 13:15:01.059179	9	2026-01-16 13:15:01.035	0	9
304	182			media	Verificar problema na rede. 	\N	aguardando	\N	2026-01-19 11:54:20.51843	2026-01-19 11:54:20.51843	9	2026-01-19 11:54:20.249	0	9
301	134			alta	Serviço da rede e ligar nobreak. 	\N	aguardando	\N	2026-01-16 14:39:28.171684	2026-01-16 14:39:45.252	9	2026-01-23 03:00:00	0	9
302	127			media	Impressora Brother não liga, provavelmente foi ligada em 220v	\N	aguardando	\N	2026-01-19 11:46:52.52598	2026-01-19 11:46:52.52598	7	2026-01-19 11:46:52.507	0	7
303	182			media		\N	aguardando	\N	2026-01-19 11:53:51.737497	2026-01-19 11:53:51.737497	9	2026-01-19 11:53:51.72	0	9
305	176			media	Instalar IMP no escritório	\N	aguardando	\N	2026-01-19 11:55:39.867178	2026-01-19 11:55:39.867178	9	2026-01-19 11:55:39.598	0	9
306	56			media	Verificar internet chalés. 	\N	aguardando	\N	2026-01-19 13:14:47.284167	2026-01-19 13:14:47.284167	9	2026-01-19 13:14:46.987	0	9
299	120			media	Desktop pra analisar. 	\N	em_andamento	\N	2026-01-15 12:57:40.493253	2026-01-19 13:15:01.296	9	2026-01-15 12:57:40.475	0	9
298	120			media	Cameras da casa 	\N	em_andamento	\N	2026-01-15 12:57:17.997428	2026-01-19 13:15:11.935	9	2026-01-15 12:57:17.742	0	9
\.


--
-- Data for Name: client_notes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.client_notes (id, client_id, content, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.clients (id, name, email, phone, cpf, address, city, state, status, created_at, document_type) FROM stdin;
63	CEMED	\N	\N	\N	\N	\N	\N	ativo	2025-07-09 11:24:58.225218	cpf
64	Assis Carlos 	\N	\N	\N	\N	\N	\N	ativo	2025-07-09 14:28:59.389325	cpf
65	Valeska Adrisly	\N	\N	\N	\N	\N	\N	ativo	2025-07-10 12:06:50.910951	cpf
66	Joan Azevedo	\N	\N	\N	\N	\N	\N	ativo	2025-07-10 12:07:05.313176	cpf
67	Empório Atual	\N	\N	\N	\N	\N	\N	ativo	2025-07-10 13:47:49.852475	cpf
68	Simone Finótica	\N	\N	\N	\N	\N	\N	ativo	2025-07-11 10:35:09.072776	cpf
69	Granja Beira Rio 	\N	\N	\N	\N	\N	\N	ativo	2025-07-11 12:28:30.386122	cpf
70	Nerilde Carvalho	\N	\N	\N	\N	\N	\N	ativo	2025-07-14 17:11:34.902212	cpf
71	Lucas Duarte Aires	\N	\N	\N	\N	\N	\N	ativo	2025-07-14 17:55:13.05719	cpf
72	Márcio Handara	\N	\N	\N	\N	\N	\N	ativo	2025-07-16 17:09:37.069448	cpf
13	Afra Matias Adv	\N	\N	\N	\N	Mossoró	RN	ativo	2025-06-24 13:17:20.002612	cpf
14	Aduern	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 13:18:57.880714	cpf
73	Atacadão dos Perfumes	\N	\N	\N	\N	\N	\N	ativo	2025-07-17 14:13:32.599482	cpf
17	Alexandro Marques ADV	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 13:20:20.017929	cpf
19	Ampla Corretora 	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 13:21:00.453245	cpf
20	Andiro - Pousada Racho de Serra	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 13:21:36.194961	cpf
21	Andrelino Paraíba 	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 13:22:11.470907	cpf
22	Angelina Importados	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 13:26:31.844261	cpf
23	Azienda Contábil 	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 13:27:41.376969	cpf
25	CAM 	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 13:29:05.385989	cpf
26	CEOM	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 13:29:18.826508	cpf
27	Carlos mercadinho pau branco	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 13:29:54.946233	cpf
28	Cia da Fórmula	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 13:30:30.330465	cpf
29	Climegy	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 13:30:50.705623	cpf
30	Cláudio Palheta	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 13:31:17.424419	cpf
33	Finótica 	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 13:36:45.44849	cpf
34	UTI da retro	\N	\N	\N	\N	\N	\N	ativo	2025-06-25 23:45:35.556933	cpf
35	Cláudio Palheta	\N	\N	\N	\N	\N	\N	ativo	2025-06-25 23:46:04.125867	cpf
74	Bruno aduern jornalismo	\N	\N	\N	\N	\N	\N	ativo	2025-07-17 15:55:32.085202	cpf
37	Progel	\N	\N	\N	\N	Mossoró	\N	ativo	2025-06-27 13:48:16.40672	cpf
38	Vica WMT	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 18:26:38.836655	cpf
39	Dr. Fabiano	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 18:26:52.015951	cpf
31	Dr. Sérgio	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 13:35:21.165433	cpf
40	NGO	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 18:29:10.514739	cpf
8	Clínica Odete Rosado	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 01:03:05.966658	cpf
16	Nutrinow	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 13:19:54.273887	cpf
87	E. E. João de Abreu	\N	\N	\N	\N	\N	\N	ativo	2025-08-03 13:33:04.232168	cpf
41	Mastercar	\N	\N	15292813000170	\N	\N	\N	ativo	2025-06-27 18:32:24.616024	cpf
42	Manu Abel Coelho	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 18:33:06.885558	cpf
43	Perfeito Beach Guilherme	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 18:47:55.143752	cpf
44	Fenda do Biquini David	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 18:48:09.132752	cpf
45	Rei dos Colchões Telma	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 18:48:53.928787	cpf
46	Rômulo Paiva	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 18:49:16.660165	cpf
47	Carol Rosado ADV	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 18:49:41.17636	cpf
48	Júlia ADV	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 18:49:52.427129	cpf
49	Paul David	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 18:50:24.95736	cpf
50	Jacinta Aduern	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 18:50:36.969053	cpf
51	Renato Alves Kilza	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 18:50:55.525523	cpf
53	JKL Wilson Chinês 	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 18:53:36.788117	cpf
54	Ferreira Calçados	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 18:53:55.533288	cpf
55	Handara/Soyler Márcio	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 18:55:03.407686	cpf
57	Dunlop Pneus	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 22:48:39.899665	cpf
58	Dra. Fátima Trajano	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 22:49:27.655026	cpf
59	Venneza - Eurorent	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 22:49:53.164736	cpf
60	Gautier	\N	\N	\N	\N	\N	\N	ativo	2025-06-28 07:29:46.6227	cpf
61	Clínica Mariana Lopes	\N	\N	\N	\N	\N	\N	ativo	2025-06-28 07:30:35.361651	cpf
11	AFIM	afimsa1986@gmail.com	\N	\N	\N	Mossoró	RN	ativo	2025-06-24 13:15:34.044562	cpf
62	Pousada Beijomar	\N	\N	\N	\N	\N	\N	ativo	2025-06-29 00:31:55.431163	cpf
1	Saída Marcelo	\N	\N	\N	\N	\N	\N	ativo	2025-07-01 23:02:14.742642	cpf
2	Wireline Brasil	\N	\N	\N	\N	\N	\N	ativo	2025-07-03 11:22:58.683	cpf
3	Alex Nutrinow Matriz	\N	\N	\N	\N	\N	\N	ativo	2025-07-03 11:51:35.612861	cpf
4	Alex Nutrinow Filial	\N	\N	\N	\N	\N	\N	ativo	2025-07-03 11:51:55.012226	cpf
5	Mossoró Calçados	\N	\N	\N	\N	\N	\N	ativo	2025-07-03 20:03:23.318729	cpf
6	Crefisa	\N	\N	\N	\N	\N	\N	ativo	2025-07-03 20:36:58.487061	cpf
7	Ivanaldo Xavier	\N	\N	\N	\N	\N	\N	ativo	2025-07-04 14:12:09.698416	cpf
75	Manoel Mat. construção 	\N	\N	\N	\N	\N	\N	ativo	2025-07-17 18:28:43.502953	cpf
76	Findup	\N	\N	\N	\N	\N	\N	ativo	2025-07-17 20:32:52.085286	cpf
10	Toinha	\N	\N	\N	\N	\N	\N	ativo	2025-07-07 11:28:46.059301	cpf
77	Camilos Construções	\N	\N	\N	\N	\N	\N	ativo	2025-07-22 12:14:17.95658	cpf
12	Dra. Verônica Ginecologista	\N	\N	\N	\N	\N	\N	ativo	2025-07-07 12:59:43.636534	cpf
78	Luciana Medeiros AFIM	\N	\N	\N	\N	Mossoró	RN	ativo	2025-07-25 14:44:58.627472	cpf
79	Ramon Cliente Thiago	\N	\N	\N	\N	\N	\N	ativo	2025-07-28 17:57:58.680467	cpf
15	3S	\N	\N	\N	\N	\N	\N	ativo	2025-07-07 14:08:35.64384	cpf
80	Adeilton Móveis	\N	\N	\N	\N	\N	\N	ativo	2025-07-28 18:12:12.802868	cpf
81	Isaias Engenheiro	\N	\N	\N	\N	\N	\N	ativo	2025-07-28 19:16:40.367759	cpf
82	Emiliano "prime" Elexus	\N	\N	\N	\N	\N	\N	ativo	2025-07-29 02:26:55.559794	cpf
83	Lavie Ritinha	\N	\N	\N	\N	\N	\N	ativo	2025-07-29 21:24:40.087218	cpf
84	Clínica Sentidos	\N	\N	\N	\N	\N	\N	ativo	2025-07-30 12:56:29.262463	cpf
85	Pricilla	\N	\N	\N	\N	\N	\N	ativo	2025-07-30 13:19:32.088663	cpf
86	David Ranne	\N	\N	\N	\N	\N	\N	ativo	2025-08-01 17:50:40.869539	cpf
88	Erica Barreto	\N	\N	\N	\N	\N	\N	ativo	2025-08-06 15:30:26.659045	cpf
89	José Alfredo e Priscila.	\N	\N	\N	\N	\N	\N	ativo	2025-08-07 19:00:51.825714	cpf
90	Bellas Center	\N	\N	\N	\N	\N	\N	ativo	2025-08-13 14:22:15.576755	cpf
91	Loja 3D Santo Antônio	\N	\N	\N	\N	\N	\N	ativo	2025-08-15 13:51:27.535958	cpf
92	Júnior Mendonça mercadinho	\N	\N	\N	\N	\N	\N	ativo	2025-08-15 21:37:37.500913	cpf
24	Best Laser Oitava Mall Loja1	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 13:28:50.238684	cpf
93	Best Laser Oitava Mall Loja2	\N	\N	\N	\N	\N	\N	ativo	2025-08-18 19:45:50.23966	cpf
94	Marcolino Distribuidora	\N	\N	\N	\N	\N	\N	ativo	2025-08-18 20:22:53.074379	cpf
95	Talitaconcept	\N	\N	\N	\N	\N	\N	ativo	2025-08-20 11:34:21.094042	cpf
96	Rossini	\N	\N	\N	\N	\N	\N	ativo	2025-08-25 10:25:40.6358	cpf
36	Condutec	\N	\N	\N	\N	\N	\N	ativo	2025-07-08 13:12:55.719044	cpf
97	Duanny	\N	\N	\N	\N	\N	\N	ativo	2025-08-25 10:26:20.836846	cpf
99	Valério Contador	\N	\N	\N	\N	\N	\N	ativo	2025-08-28 11:12:36.909245	cpf
100	Dr. Ronaldo Fixina	\N	\N	\N	\N	\N	\N	ativo	2025-08-29 01:04:41.960383	cpf
101	Climente	\N	\N	\N	\N	\N	\N	ativo	2025-09-01 19:04:48.83359	cpf
102	Mary Marcelo da Pop	\N	\N	\N	\N	Mossoró 	RN	ativo	2025-09-06 12:55:20.163495	cpf
104	Atacadão dos Perfumes	\N	\N	\N	\N	\N	\N	ativo	2025-09-11 14:06:37.44386	cpf
105	Dra. Rosário	\N	\N	\N	\N	\N	\N	ativo	2025-09-12 19:40:06.552989	cpf
56	Hotel Villaoeste	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 18:55:33.08893	cpf
106	Dr. Estrias	\N	\N	\N	\N	\N	\N	ativo	2025-09-16 20:44:35.578739	cpf
107	Dra Estrias	\N	\N	\N	\N	\N	\N	ativo	2025-09-18 19:30:48.336691	cpf
18	Amme Cosméticos 	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 13:20:37.661692	cpf
9	E. E. Abel Coelho	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 03:33:48.103598	cpf
98	Cristo Redentor	\N	\N	\N	\N	\N	\N	ativo	2025-08-25 12:49:43.80329	cpf
32	Empório	\N	\N	\N	\N	\N	\N	ativo	2025-06-24 13:36:12.66588	cpf
52	2 A Assessoria Jaciara Queiroz	\N	\N	\N	\N	\N	\N	ativo	2025-06-27 18:51:11.07379	cpf
103	Dr. Isaías - Oftalmo Clinical	\N	\N	\N	\N	\N	\N	ativo	2025-09-10 13:24:03.239603	cpf
108	Saul Rodrigues AFIM	\N	\N	\N	\N	\N	\N	ativo	2025-09-22 11:40:00.433568	cpf
109	Dluxo Óptica Jéssica	\N	\N	\N	\N	\N	\N	ativo	2025-09-22 20:06:22.749195	cpf
110	Júnior (forte) Lima AFIM	\N	\N	\N	\N	\N	\N	ativo	2025-09-24 03:21:26.029619	cpf
111	Adauto ADV	\N	\N	\N	\N	\N	\N	ativo	2025-09-24 12:16:58.078009	cpf
112	Dalvani Targino	\N	\N	\N	\N	\N	\N	ativo	2025-09-25 01:15:10.083694	cpf
113	Andréa Dalama	\N	\N	\N	\N	\N	\N	ativo	2025-09-25 01:19:34.013386	cpf
114	Dr. Otávio Bessa	\N	\N	\N	\N	\N	\N	ativo	2025-09-30 20:18:36.549244	cpf
115	Arthur AFIM	\N	\N	\N	\N	\N	\N	ativo	2025-10-06 14:15:33.368691	cpf
116	Uniplast	\N	\N	\N	\N	\N	\N	ativo	2025-10-10 14:34:53.92454	cpf
117	João Paulo Itin	\N	\N	\N	\N	\N	\N	ativo	2025-10-14 18:13:00.979284	cpf
118	Arlene Duarte	\N	\N	\N	\N	\N	\N	ativo	2025-10-17 17:22:38.087653	cpf
119	Comercial Tintas e Construções	\N	\N	\N	Rua Frei Miguelino 	\N	\N	ativo	2025-10-20 16:09:35.311029	cpf
120	Luizin	\N	\N	\N	\N	\N	\N	ativo	2025-10-21 12:02:21.191637	cpf
121	Jhon	\N	\N	\N	\N	\N	\N	ativo	2025-10-22 04:17:26.353465	cpf
122	Julia Alves ADV	\N	\N	\N	\N	\N	\N	ativo	2025-10-27 12:29:28.117847	cpf
123	Eliene Barbosa	\N	\N	\N	\N	\N	\N	ativo	2025-10-29 12:59:49.251196	cpf
124	CEUP	\N	\N	\N	\N	\N	\N	ativo	2025-10-29 13:07:57.760214	cpf
125	Mil Cheiros Opções	\N	\N	\N	\N	\N	\N	ativo	2025-10-29 15:52:10.8319	cpf
126	Dr. Andre Lima - Instituto Wilson Rosado	\N	\N	\N	\N	\N	\N	ativo	2025-10-30 14:49:30.85054	cpf
128	Miguel Nunes DJ	\N	\N	\N	\N	\N	\N	ativo	2025-11-04 13:58:19.086435	cpf
129	Água Santa Clara	\N	\N	\N	\N	\N	\N	ativo	2025-11-07 13:12:36.835249	cpf
130	Casa do Celular	\N	\N	\N	\N	\N	\N	ativo	2025-11-11 18:57:40.191004	cpf
132	Eliene Barbosa	\N	\N	\N	\N	\N	\N	ativo	2025-11-12 11:37:35.439835	cpf
133	Raília	\N	\N	\N	\N	\N	\N	ativo	2025-11-12 16:27:59.689634	cpf
134	Sama	\N	\N	\N	\N	\N	\N	ativo	2025-11-13 14:56:16.082172	cpf
135	Helena Mara	\N	\N	\N	\N	\N	\N	ativo	2025-11-18 13:52:52.943233	cpf
136	Salão Vintage Hair	\N	\N	\N	\N	\N	\N	ativo	2025-11-19 17:32:21.656268	cpf
127	E. E. Gilberto Rola	\N	\N	\N	\N	\N	\N	ativo	2025-10-31 14:34:34.22619	cpf
131	ACMED	\N	\N	\N	\N	\N	\N	ativo	2025-11-12 11:35:36.986109	cpf
140	Shirley Aquino - Abel	\N	\N	\N	\N	\N	\N	ativo	2025-11-23 23:40:40.017603	cpf
141	Alcimar Gurgel	\N	\N	\N	\N	\N	\N	ativo	2025-11-24 00:06:14.851553	cpf
142	San Saúde	\N	\N	\N	\N	\N	\N	ativo	2025-11-24 11:04:32.347776	cpf
143	Botoclinic Mossoró	\N	\N	\N	\N	\N	\N	ativo	2025-11-24 13:55:25.657647	cpf
144	testes assistencia	teste@teste.com	84988363828	1234567890	Rua Maria Alves de Queiroz numero 2717	Mossoro	RN	ativo	2025-11-24 19:08:35.029385	cpf
148	Policlínica	\N	\N	\N	\N	\N	\N	ativo	2025-11-25 03:20:58.106926	cpf
149	Depósito São Lourenço 	\N	\N	\N	\N	Mossoró 	RN	ativo	2025-11-25 13:59:06.95581	cpf
150	Flademir Santana	\N	\N	\N	\N	\N	\N	ativo	2025-11-26 13:13:59.385444	cpf
151	Loja 3D Serra do Mel	\N	\N	\N	\N	\N	\N	ativo	2025-12-01 20:25:48.843895	cpf
152	Testestestes	\N	\N	\N	\N	\N	\N	ativo	2025-12-01 20:27:14.378695	cpf
153	Loja 3D Baraúnas	\N	\N	\N	\N	\N	\N	ativo	2025-12-01 20:27:35.401096	cpf
157	sda sda	\N	\N	\N	\N	\N	\N	ativo	2025-12-01 21:07:15.875189	cpf
165	E. E. Manoel Justiniano	\N	\N	\N	\N	\N	\N	ativo	2025-12-02 12:30:22.754141	cpf
166	Fátima Días - Martins	\N	\N	\N	\N	\N	\N	ativo	2025-12-03 13:17:24.083891	cpf
167	Taciana	\N	\N	\N	\N	\N	\N	ativo	2025-12-04 16:32:05.851396	cpf
168	Ariana França	\N	\N	\N	\N	\N	\N	ativo	2025-12-05 13:14:18.499257	cpf
169	Juscileide Dantas - Nitinha	\N	\N	\N	\N	\N	\N	ativo	2025-12-05 13:21:06.387578	cpf
170	Balão do Dia	\N	\N	\N	\N	\N	\N	ativo	2025-12-05 15:30:47.405667	cpf
171	Taffarel Maia	\N	\N	\N	\N	\N	\N	ativo	2025-12-09 14:05:15.19908	cpf
172	Maycon Crynos	\N	\N	\N	\N	\N	\N	ativo	2025-12-11 20:55:32.119121	cpf
173	Thiago Couto	\N	\N	\N	\N	\N	\N	ativo	2025-12-18 20:18:01.227801	cpf
174	Sertão Frios	\N	\N	\N	\N	\N	\N	ativo	2025-12-19 13:02:14.666317	cpf
175	Merry Cherry	\N	\N	\N	\N	\N	\N	ativo	2025-12-20 13:53:32.431343	cpf
176	Pollyana Pinto	\N	\N	\N	\N	\N	\N	ativo	2025-12-26 19:26:32.450183	cpf
177	Rômulo Paiva ADV	\N	\N	\N	\N	\N	\N	ativo	2025-12-29 18:05:54.98663	cpf
178	Luana Ramos	\N	\N	\N	\N	\N	\N	ativo	2025-12-30 20:06:08.061638	cpf
179	Renata Abl 3	\N	\N	\N	\N	\N	\N	ativo	2026-01-09 11:08:15.950911	cpf
180	Jacinta Rocha Salão	\N	\N	\N	\N	\N	\N	ativo	2026-01-13 11:35:37.487596	cpf
181	Isabel Linhares - Clínica Mariana Lopes	\N	\N	\N	\N	\N	\N	ativo	2026-01-14 14:23:21.401242	cpf
182	Kaio Victor	\N	\N	\N	\N	\N	\N	ativo	2026-01-19 11:53:48.654878	cpf
\.


--
-- Data for Name: digital_certificates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.digital_certificates (id, name, subject_name, issuer_name, serial_number, cnpj, certificate_path, expiry_date, status, created_at, updated_at) FROM stdin;
1	sasdsada	BRASIL E MATOS LTDA:00623949000148	ICP-Brasil	00fcd5f49686fca514f8f7	\N	/home/runner/workspace/certs/cert_1765371702525.pfx	2026-07-10 12:57:56	active	2025-12-10 13:01:42.542964	2025-12-10 13:01:42.542964
\.


--
-- Data for Name: download_links; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.download_links (id, title, url, type, description, created_at) FROM stdin;
3	Ver IP com um toque	https://meuip.com/api/meuip.php	useful	API do site meu IP que mostra o IP público	2025-12-03 07:34:07.536265
\.


--
-- Data for Name: financial_transactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.financial_transactions (id, description, client_id, call_id, type, amount, status, due_date, paid_at, created_at, user_id, updated_at, completed_by_user_id, completed_at, parent_transaction_id, installment_number, total_installments, resolution, service_id, service_amount, product_amount, service_details, product_details, call_date, service_date, billing_date, original_amount, discount_amount, created_by_user_id) FROM stdin;
23	Visita técnica para instalar e configurar Chromebook na supervisão. Instalação de programas e configuração da impressora.\n\nDiscriminação de valores:\n\nServiços:\n- Visita técnica para instalar e configurar Chromebook na supervisão. Instalação de programas e configuração da impressora.: R$ 120,00\n\n[{"name":"Visita técnica para instalar e configurar Chromebook na supervisão. Instalação de programas e configuração da impressora.","description":"Visita técnica para instalar e configurar Chromebook na supervisão. Instalação de programas e configuração da impressora.","type":"servico","price":120,"amount":120,"quantity":1}]	9	\N	entrada	120.00	pendente	\N	\N	2025-07-14 03:00:00	1	2025-07-29 12:55:38.943	\N	\N	\N	\N	\N	Instalar chromebook na supervisão. 	35	120.00	0.00	[{"name":"Visita técnica para instalar e configurar Chromebook na supervisão. Instalação de programas e configuração da impressora.","amount":120,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
123	Acesso remoto para ajustes na configuração das impressoras na rede	83	130	entrada	50.00	pago	\N	2025-07-30 16:36:43.524	2025-07-30 03:00:00	1	2025-07-30 16:36:43.573	1	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
5	Visita técnica para reconfiguração do serviço DICOM nas máquinas de ultrassom Philips, com redirecionamento para o servidor. A configuração havia sido perdida após intervenção de manutenção realizada por técnico de fora. 	8	\N	entrada	300.00	pendente	\N	\N	2025-07-07 03:00:00	5	2025-08-03 13:08:33.239	\N	\N	\N	\N	\N	Configurar DICOM nas duas ultrassom Philips. Após manutenção do técnico perdeu a configuração. 	10	300.00	0.00	[{"name":"Serviço - ","amount":300,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
207	2x memórias 8gb DDR 3 1333mhz villaoeste e aduern	\N	\N	saida	140.00	pago	\N	2025-08-05 20:23:24.061	2025-08-05 20:23:24.061	1	2025-08-05 20:23:24.251658	1	2025-08-05 20:23:24.061	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
212	Transformador 1500 va impressora AFIM 	\N	\N	saida	150.00	pago	\N	2025-08-08 12:05:12.696	2025-08-08 03:00:00	1	2025-08-09 00:46:20.713	1	2025-08-08 12:05:12.696	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
234	Teclado Sony vaio Engenheiro de Mário Sérgio	\N	\N	saida	122.00	pago	\N	2025-08-14 20:30:08.926	2025-08-14 03:00:00	1	2025-08-14 20:30:40.573	1	2025-08-14 20:30:08.926	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-08-14 20:30:09.095629	\N	0.00	1
449	Afra Matias	\N	\N	entrada	1410.00	pago	\N	2025-10-09 13:55:42.039	2025-10-09 13:55:27.843	1	2025-10-09 13:55:41.961	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-09 13:55:27.99941	\N	0.00	1
450	Kalione restam 400	\N	\N	saida	200.00	pago	\N	2025-10-09 22:17:38.419	2025-10-09 22:17:38.419	1	2025-10-09 22:17:38.895308	1	2025-10-09 22:17:38.419	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-09 22:17:38.895308	\N	0.00	1
245	2x monitores tipo A Kalione	\N	\N	saida	500.00	pago	\N	2025-08-20 12:45:26.682	2025-08-20 12:45:26.682	1	2025-08-20 12:45:26.847744	1	2025-08-20 12:45:26.682	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-20 12:45:26.847744	\N	0.00	1
250	SSD 240 gb Azienda JOF	\N	\N	saida	120.00	pago	\N	2025-08-20 22:02:51.752	2025-08-20 22:02:51.752	1	2025-08-20 22:02:51.927665	1	2025-08-20 22:02:51.752	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-20 22:02:51.927665	\N	0.00	1
477	Acesso remoto para resolver problema no pacote office notebook Alvanize. 	56	\N	entrada	50.00	pendente	\N	\N	2025-09-10 18:47:18.5	5	2025-10-22 04:28:19.749446	\N	\N	\N	\N	\N	\N	238	50.00	0.00	[{"name":"Acesso remoto para resolver problema no pacote office notebook Alvanize. ","amount":50,"type":"servico"}]	[]	\N	\N	2025-10-22 04:28:19.749446	\N	0.00	1
495	Manutenção preventiva desktop - Limpeza interna, desoxidação das placas e troca da pasta térmica. Testes. 	127	320	entrada	180.00	pendente	\N	\N	2025-06-05 03:00:00	5	2025-10-31 15:42:27.355015	\N	\N	\N	\N	\N	\N	324	180.00	0.00	[{"name":"Manutenção preventiva desktop - Limpeza interna, desoxidação das placas e troca da pasta térmica. Testes. ","amount":180,"type":"servico"}]	[]	\N	\N	2025-10-31 15:42:27.355015	\N	0.00	1
22	Manutenção preventiva all in one \nItens: Manutenção preventiva completa - R$ 80; Bateria CMOS (bateria da placa mãe) - R$ 10; Pasta térmica alta temperatura - R$ 10	69	\N	entrada	100.00	pago	\N	2025-07-29 02:33:59.574	2025-07-14 11:39:13.633507	1	2025-07-29 02:33:59.551	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
19	Manutenção nobreak com troca de bateria	68	\N	entrada	200.00	pago	\N	2025-07-29 02:34:22.294	2025-07-11 03:00:00	1	2025-07-29 02:34:22.105	1	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
158	Parcela 1/5 - Manutenção preventiva de todas as máquinas das 3 lojas. 	28	141	entrada	320.00	pago	2025-07-31 03:00:00	2025-07-31 11:45:10.123	2025-07-31 03:00:00	5	2025-07-31 11:45:10.694	9	\N	156	1	5	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
7	Restante da nota dos PCs e nota serviço na sala do diretor	11	\N	entrada	1590.00	pago	\N	2025-07-29 02:35:19.339	2025-07-08 03:00:00	1	2025-07-29 02:35:19.188	1	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
1	Queijo lá do irmão	1	\N	saida	200.00	pago	\N	2025-07-31 02:16:22.307	2025-07-01 03:00:00	1	2025-07-31 02:16:22.127	1	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
6	Tomadas de rede RJ 45 Queiroz e filhos	\N	\N	saida	50.00	pago	\N	2025-07-31 02:16:26.243	2025-07-08 03:00:00	1	2025-07-31 02:16:26.062	1	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
18	Bolo na Odete	\N	\N	saida	10.00	pago	\N	2025-07-31 02:16:29.916	2025-07-10 03:00:00	1	2025-07-31 02:16:29.73	1	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
21	Gregos depois do almoço no Abel 	\N	\N	saida	15.00	pago	\N	2025-07-31 02:14:54.701	2025-07-11 03:00:00	1	2025-07-31 02:14:55.049	1	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
17	Cabo USB impressora Odete	\N	\N	saida	15.00	pago	\N	2025-07-31 02:16:34.534	2025-07-10 03:00:00	1	2025-07-31 02:16:34.351	1	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
159	Parcela 2/5 - Manutenção preventiva de todas as máquinas das 3 lojas. 	28	141	entrada	320.00	pendente	2025-08-31 03:00:00	\N	2025-08-31 03:00:00	5	2025-07-31 11:40:57.75854	\N	\N	156	2	5	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
161	Parcela 4/5 - Manutenção preventiva de todas as máquinas das 3 lojas. 	28	141	entrada	320.00	pendente	2025-10-31 03:00:00	\N	2025-10-31 03:00:00	5	2025-07-31 11:40:57.857832	\N	\N	156	4	5	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
10	Ajustes na configuração da impressora\n\nDiscriminação de valores:\n\nServiços:\n- Visita técnica ajustes na impressora Epson loja 2: R$ 80,00\n\n[{"name":"Visita técnica ajustes na impressora Epson loja 2","description":"Visita técnica ajustes na impressora Epson loja 2","type":"servico","price":80,"amount":80,"quantity":1}]	33	\N	entrada	80.00	pendente	\N	\N	2025-07-08 23:56:37.130616	1	2025-07-08 23:56:37.130616	\N	\N	\N	\N	\N	Visita para ver impressora que ficou devagar quase parando	6	80.00	0.00	[{"name":"Visita técnica ajustes na impressora Epson loja 2","amount":80,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
9	Ajustes na rede e CPU diretoria\n\nDiscriminação de valores:\n\nServiços:\n- Instalação ponto de rede sala diretoria, ajustes na rede das câmeras da sala de corte: R$ 130,00\n\nProdutos/Materiais:\n- Tomada RJ 45 : R$ 35,00\n- Cabo de rede RJ 45 10 metros: R$ 35,00\n\n[{"name":"Tomada RJ 45 ","amount":35,"type":"produto"},{"name":"Cabo de rede RJ 45 10 metros","description":"Cabo de rede RJ 45 10 metros","type":"produto","price":35,"amount":35,"quantity":1},{"name":"Instalação ponto de rede sala diretoria, ajustes na rede das câmeras da sala de corte","description":"Instalação ponto de rede sala diretoria, ajustes na rede das câmeras da sala de corte","type":"servico","price":130,"amount":130,"quantity":1}]	11	\N	entrada	200.00	pago	\N	2025-07-24 15:56:57.997	2025-07-08 23:54:21.602388	1	2025-07-24 15:56:58.203	1	\N	\N	\N	\N	Ajustes na rede e CPU diretoria	15	130.00	70.00	[{"name":"Instalação ponto de rede sala diretoria, ajustes na rede das câmeras da sala de corte","amount":130,"type":"servico"}]	[{"name":"Tomada RJ 45 ","amount":35,"type":"produto"},{"name":"Cabo de rede RJ 45 10 metros","amount":35,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
2	Monitor Dell 	45	\N	entrada	350.00	pago	\N	2025-07-28 11:37:51.137	2025-07-02 21:36:35.180974	1	2025-07-28 11:37:51.263	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
451	Estabilizador torre 500 va Kalione	\N	\N	saida	100.00	pago	\N	2025-10-09 22:18:05.933	2025-10-09 22:18:05.933	1	2025-10-09 22:18:06.104509	1	2025-10-09 22:18:05.933	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-09 22:18:06.104509	\N	0.00	1
156	Manutenção preventiva de todas as máquinas das 3 lojas. 	28	141	entrada	1600.00	pendente	\N	\N	2025-07-16 03:00:00	5	2025-12-13 02:21:46.64	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
157	Desktop completo para recepção João da Escóssia.	28	142	entrada	1000.00	pendente	\N	\N	2025-07-17 03:00:00	5	2025-12-13 02:21:54.891	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
30	Acesso remoto para liberar portas de acesso para DVR novo. Contato com o Neto da Olho Vivo.\n\nDiscriminação de valores:\n\nServiços:\n- Acesso remoto para liberar portas de acesso para DVR novo. Contato com o Neto da Olho Vivo. : R$ 50,00\n\n[{"name":"Acesso remoto para liberar portas de acesso para DVR novo. Contato com o Neto da Olho Vivo. ","description":"Acesso remoto para liberar portas de acesso para DVR novo. Contato com o Neto da Olho Vivo. ","type":"servico","price":50,"amount":50,"quantity":1}]	8	\N	entrada	50.00	pendente	\N	\N	2025-07-18 03:00:00	1	2025-07-29 12:54:41.926	\N	\N	\N	\N	\N	Configurar acesso externo DVR novo	43	50.00	0.00	[{"name":"Acesso remoto para liberar portas de acesso para DVR novo. Contato com o Neto da Olho Vivo. ","amount":50,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
440	Ajustes CPU Dra Isabelli que estava com erro na impressora, substituição bateria CMOS CPU coleta, ajustes na CPU raio-x (garantia)	8	\N	entrada	100.00	pendente	\N	\N	2025-10-08 03:00:00	5	2025-11-13 14:21:10.176	\N	\N	\N	\N	\N		286	100.00	0.00	[{"name":"Ajustes CPU Dra Isabelli que estava com erro na impressora, substituição bateria CMOS CPU coleta, ajustes na CPU raio-x (garantia)","amount":100,"type":"servico"}]	[]	\N	\N	2025-10-08 23:03:15.241756	\N	0.00	1
163	Parcela 1/5 - Desktop completo para recepção João da Escóssia.	28	142	entrada	200.00	pago	2025-07-31 03:00:00	2025-07-31 11:44:49.458	2025-07-31 03:00:00	5	2025-07-31 11:44:50.107	9	\N	157	1	5	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
26	Serviço -\n\nDiscriminação de valores:\n\nServiços:\n- Diagnóstico e manutenção na infraestrutura de rede, com foco em melhorias de desempenho. Identificados e corrigidos pontos de limitação na conexão causados por equipamentos e conectores inadequados. Realizada a instalação de roteador Gigabit no 1º andar, passagem de cabo de rede para o PC do Lucas e substituição da tomada RJ45 no quarto do Thiago.: R$ 250,00\n\nProdutos/Materiais:\n- 5m Cabos de rede Cat5.E 100% Cobre.: R$ 25,00\n- Tomada de Rede CAT6 Tramontina.: R$ 40,00\n- Roteador Intelbras Giga W6. : R$ 250,00\n\n[{"name":"5m Cabos de rede Cat5.E 100% Cobre.","amount":25,"type":"produto"},{"name":"Tomada de Rede CAT6 Tramontina.","amount":40,"type":"produto"},{"name":"Diagnóstico e manutenção na infraestrutura de rede, com foco em melhorias de desempenho. Identificados e corrigidos pontos de limitação na conexão causados por equipamentos e conectores inadequados. Realizada a instalação de roteador Gigabit no 1º andar, passagem de cabo de rede para o PC do Lucas e substituição da tomada RJ45 no quarto do Thiago.","description":"Diagnóstico e manutenção na infraestrutura de rede, com foco em melhorias de desempenho. Identificados e corrigidos pontos de limitação na conexão causados por equipamentos e conectores inadequados. Realizada a instalação de roteador Gigabit no 1º andar, passagem de cabo de rede para o PC do Lucas e substituição da tomada RJ45 no quarto do Thiago.","type":"servico","price":250,"amount":250,"quantity":1},{"name":"Roteador Intelbras Giga W6. ","description":"Roteador Intelbras Giga W6. ","type":"produto","price":250,"amount":250,"quantity":1}]	70	\N	entrada	565.00	parcial	\N	\N	2025-07-14 17:51:03.647402	1	2025-07-28 13:04:50.2	\N	\N	\N	\N	\N	Serviço -	41	250.00	315.00	[{"name":"Diagnóstico e manutenção na infraestrutura de rede, com foco em melhorias de desempenho. Identificados e corrigidos pontos de limitação na conexão causados por equipamentos e conectores inadequados. Realizada a instalação de roteador Gigabit no 1º andar, passagem de cabo de rede para o PC do Lucas e substituição da tomada RJ45 no quarto do Thiago.","amount":250,"type":"servico"}]	[{"name":"5m Cabos de rede Cat5.E 100% Cobre.","amount":25,"type":"produto"},{"name":"Tomada de Rede CAT6 Tramontina.","amount":40,"type":"produto"},{"name":"Roteador Intelbras Giga W6. ","amount":250,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
213	Gregos irmão 	\N	\N	saida	14.00	pago	\N	2025-08-08 12:05:54.919	2025-08-08 12:05:54.919	1	2025-08-08 12:05:55.09411	1	2025-08-08 12:05:54.919	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
208	Acesso remoto para instalar scaner Epson no laboratório. 	8	\N	entrada	50.00	pendente	\N	\N	2025-08-05 16:48:13.629	5	2025-08-06 15:16:51.539247	\N	\N	\N	\N	\N	\N	153	50.00	0.00	[{"name":"Acesso remoto para instalar scaner Epson no laboratório. ","amount":50,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
209	Instalação da impressora do Financeiro que foi pra o bloco novo. Instalação na rede nova e mapeado nos computadores.	37	\N	entrada	150.00	pendente	\N	\N	2025-08-05 03:00:00	5	2025-08-06 15:18:34.16604	\N	\N	\N	\N	\N	\N	154	150.00	0.00	[{"name":"Instalação da impressora do Financeiro que foi pra o bloco novo. Instalação na rede nova e mapeado nos computadores.","amount":150,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
224	Visita técnica para realocação do PC do Canacafé, integrando-o à rede por meio de novo cabo de rede previamente instalado.	56	\N	entrada	150.00	pendente	\N	\N	2025-08-08 03:00:00	5	2025-08-13 20:40:55.142725	\N	\N	\N	\N	\N	\N	161	150.00	0.00	[{"name":"Visita técnica para realocação do PC do Canacafé, integrando-o à rede por meio de novo cabo de rede previamente instalado.","amount":150,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
164	Parcela 2/5 - Desktop completo para recepção João da Escóssia.	28	142	entrada	200.00	pendente	2025-08-31 03:00:00	\N	2025-08-31 03:00:00	5	2025-07-31 11:42:28.444802	\N	\N	157	2	5	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
101	Visita técnica para analisar e resolver problemas no Desktop farmacêutico laboratório que ficou com erro após atualização de sistema.\n\nDiscriminação de valores:\n\nServiços:\n- 18/07 - Visita técnica para analisar e resolver problemas no Desktop farmacêutico laboratório que ficou com erro após atualização de sistema. : R$ 100,00\n\n[{"name":"18/07 - Visita técnica para analisar e resolver problemas no Desktop farmacêutico laboratório que ficou com erro após atualização de sistema. ","amount":100,"type":"servico"}]	28	\N	entrada	100.00	pendente	\N	\N	2025-07-18 03:00:00	1	2025-07-28 21:50:18.537942	\N	\N	\N	\N	\N	Serviço -	67	100.00	0.00	[{"name":"18/07 - Visita técnica para analisar e resolver problemas no Desktop farmacêutico laboratório que ficou com erro após atualização de sistema. ","amount":100,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
166	Parcela 4/5 - Desktop completo para recepção João da Escóssia.	28	142	entrada	200.00	pendente	2025-10-31 03:00:00	\N	2025-10-31 03:00:00	5	2025-07-31 11:42:28.548161	\N	\N	157	4	5	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
173	Recuperação de arquivos	81	\N	entrada	100.00	pago	\N	2025-07-31 12:01:06.798	2025-07-31 12:00:36.746	1	2025-07-31 12:01:06.653	1	\N	\N	\N	\N	\N	138	100.00	0.00	[{"name":"Recuperação de arquivos","amount":100,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
29	Reparo windows + bateria CMOS promoção	74	\N	entrada	80.00	pago	\N	2025-07-29 02:33:43.754	2025-07-17 03:00:00	1	2025-07-29 02:33:43.564	1	\N	\N	\N	\N	Troca bateria CMOS e fix Windows	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
175	04/07 - Problema impressora da recepção. Colocamos a da cozinha na recepção. RETORNO IMP PAROU NOVAMENTE. 	4	\N	entrada	100.00	pendente	\N	\N	2025-07-03 20:04:18.908	1	2025-08-01 17:46:43.087194	\N	\N	\N	\N	\N	\N	139	100.00	0.00	[{"name":"04/07 - Problema impressora da recepção. Colocamos a da cozinha na recepção. RETORNO IMP PAROU NOVAMENTE. ","amount":100,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
177	Formatação e reinstalação do sistema operacional e programas. ALL in One LG.	28	\N	entrada	150.00	pendente	\N	\N	2025-08-02 12:31:22.183	5	2025-08-03 11:52:58.046805	\N	\N	\N	\N	\N	\N	140	150.00	0.00	[{"name":"Formatação e reinstalação do sistema operacional e programas. ALL in One LG.","amount":150,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
441	Parcela 4 - Parcelamento avulso materiais e serviços 	21	\N	entrada	500.00	pago	\N	2025-10-09 13:43:06.737	2025-10-09 13:43:06.738	1	2025-10-09 13:43:06.757739	1	\N	377	4	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-09 13:43:06.757739	\N	0.00	1
442	Andrew Cell frp bypass Cel e tablet Stive	\N	\N	saida	250.00	pago	\N	2025-10-09 13:49:28.16	2025-10-09 13:49:28.16	1	2025-10-09 13:49:30.664234	1	2025-10-09 13:49:28.16	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-09 13:49:30.664234	\N	0.00	1
248	Instalação de impressora brother DCP-T430W Jato de tinta nova. Na supervisão e secretaria.	9	\N	entrada	200.00	pendente	\N	\N	2025-08-20 13:05:31.724	5	2025-08-20 13:05:55.676438	\N	\N	\N	\N	\N	\N	189	200.00	0.00	[{"name":"Instalação de impressora brother DCP-T430W Jato de tinta nova. Na supervisão e secretaria.","amount":200,"type":"servico"}]	[]	\N	\N	2025-08-20 13:05:55.676438	\N	0.00	1
258	Gasto extra sistema assistência	\N	\N	saida	18.00	pago	\N	2025-08-23 14:17:32.36	2025-08-23 14:17:32.36	1	2025-08-23 14:17:32.527299	1	2025-08-23 14:17:32.36	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-23 14:17:32.527299	\N	0.00	1
167	Parcela 5/5 - Desktop completo para recepção João da Escóssia.	28	142	entrada	200.00	pago	2025-12-01 03:00:00	2025-12-13 02:21:54.188	2025-12-01 03:00:00	9	2025-12-13 02:21:54.682	9	\N	157	5	5	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	9
377	Parcelamento avulso materiais e serviços 	21	\N	entrada	2300.00	pendente	\N	\N	2025-09-11 03:00:00	1	2025-12-20 16:17:50.321	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-09-11 16:28:45.967465	\N	0.00	1
1238	Replit mensalidade	\N	\N	saida	160.00	pago	\N	2025-12-20 03:00:00	2025-12-20 16:38:33.037	1	2025-12-20 16:38:33.297407	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-20 16:38:33.297407	\N	0.00	1
34	CPU não liga\n\nDiscriminação de valores:\n\nServiços:\n- REPOSIÇÃO FONTE DE ALIMENTAÇÃO, MANUTENÇÃO PREVENTIVA COM PASTA TÉRMICA NO PROCESSADOR.: R$ 100,00\n\nProdutos/Materiais:\n- FONTE ATX 12 V: R$ 120,00\n\n[{"name":"FONTE ATX 12 V","description":"FONTE ATX 12 V","type":"produto","price":120,"amount":120,"quantity":1},{"name":"REPOSIÇÃO FONTE DE ALIMENTAÇÃO, MANUTENÇÃO PREVENTIVA COM PASTA TÉRMICA NO PROCESSADOR.","description":"REPOSIÇÃO FONTE DE ALIMENTAÇÃO, MANUTENÇÃO PREVENTIVA COM PASTA TÉRMICA NO PROCESSADOR.","type":"servico","price":100,"amount":100,"quantity":1}]	75	\N	entrada	220.00	pago	\N	2025-07-18 20:21:26.23	2025-07-18 19:11:35.557944	1	2025-07-18 20:21:26.236	1	\N	\N	\N	\N	CPU travou e ficou chuviscando a tela	48	100.00	120.00	[{"name":"REPOSIÇÃO FONTE DE ALIMENTAÇÃO, MANUTENÇÃO PREVENTIVA COM PASTA TÉRMICA NO PROCESSADOR.","amount":100,"type":"servico"}]	[{"name":"FONTE ATX 12 V","amount":120,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
35	Visita técnica para manutenção no computador do setor de Teleatendimento. Identificado monitor com defeito; foi realizada realocação dos monitores entre o PC da Renata e o do Teleatendimento.\nDetectado pente de memória com falha, substituído. Também realizada a troca do cabo de rede e do cabo USB da impressora do setor Eletro.\nServiço incluiu mão de obra, memória RAM e cabo USB.	8	\N	entrada	350.00	pendente	\N	\N	2025-07-10 03:00:00	5	2025-08-03 14:38:29.702	\N	\N	\N	\N	\N	Monitor pra o teleatendimento. 	32	150.00	200.00	[{"name":"Visita técnica para resolver PC TeleAtendimento. Monitor com problema, colocamos outro no Pc de Renata e o de Renata foi pra o teleatendimento. Um dos pente de memória com defeito e troca do cabo de rede.","amount":150,"type":"servico"}]	[{"name":"Memória DDR3 4GB. ","amount":150,"type":"produto"},{"name":"Cabo USB para impressora Eletro.","amount":50,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
420	Reparo na impressora m1120 do faturamento e criação de contas de e-mail para a diretoria	40	\N	entrada	260.00	pago	\N	2025-10-09 13:44:53.751	2025-09-22 03:00:00	1	2025-10-09 13:44:53.988	1	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Reparo na placa da fonte HP m1120: R$ 180,00\n- Criação de emails corporativos para a diretoria: R$ 80,00\n\n[{"name":"Reparo na placa da fonte HP m1120","description":"Reparo na placa da fonte HP m1120","type":"servico","unitPrice":180,"price":180,"amount":180,"quantity":1},{"name":"Criação de emails corporativos para a diretoria","description":"Criação de emails corporativos para a diretoria","type":"servico","unitPrice":80,"price":80,"amount":80,"quantity":1}]	250	260.00	0.00	[{"name":"Reparo na placa da fonte HP m1120","amount":180,"quantity":1,"type":"servico"},{"name":"Criação de emails corporativos para a diretoria","amount":80,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-09-30 14:30:58.455156	\N	0.00	1
42	Troca do SSD de 128gb por um de 512. Instalação do sistema e programas.\n\nDiscriminação de valores:\n\nServiços:\n- Mão de obra especializada. Troca do SSD de 128gb por um de 512. Instalação do sistema e programas. Pronto pra uso. : R$ 150,00\n\nProdutos/Materiais:\n- SSD WD 512gb. 1 ano garantia. : R$ 400,00\n\n[{"name":"SSD WD 512gb. 1 ano garantia. ","description":"SSD WD 512gb. 1 ano garantia. ","type":"produto","price":400,"amount":400,"quantity":1},{"name":"Mão de obra especializada. Troca do SSD de 128gb por um de 512. Instalação do sistema e programas. Pronto pra uso. ","description":"Mão de obra especializada. Troca do SSD de 128gb por um de 512. Instalação do sistema e programas. Pronto pra uso. ","type":"servico","price":150,"amount":150,"quantity":1}]	73	\N	entrada	550.00	pendente	\N	\N	2025-07-21 03:00:00	1	2025-07-28 18:09:21.409	\N	\N	\N	\N	\N	Máquina com ssd cheio. 	55	150.00	400.00	[{"name":"Mão de obra especializada. Troca do SSD de 128gb por um de 512. Instalação do sistema e programas. Pronto pra uso. ","amount":150,"type":"servico"}]	[{"name":"SSD WD 512gb. 1 ano garantia. ","amount":400,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
1174	Revisão no sistema de câmeras e ajustes no sistema de som	136	102	entrada	800.00	pendente	\N	\N	2025-11-28 16:10:28.748	1	2025-11-28 16:10:28.767336	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Visita técnica com ajustes no DVR e no sistema de som: R$ 200,00\n\nProdutos/Materiais:\n- HD Toshiba 2TB para DVR: R$ 600,00\n\n[{"name":"HD Toshiba 2TB para DVR","description":"HD Toshiba 2TB para DVR","type":"produto","unitPrice":600,"price":600,"amount":600,"quantity":1},{"name":"Visita técnica com ajustes no DVR e no sistema de som","description":"Visita técnica com ajustes no DVR e no sistema de som","type":"servico","unitPrice":200,"price":200,"amount":200,"quantity":1}]	458	200.00	600.00	[{"name":"Visita técnica com ajustes no DVR e no sistema de som","amount":200,"quantity":1,"type":"servico"}]	[{"name":"HD Toshiba 2TB para DVR","amount":600,"quantity":1,"type":"produto"}]	\N	\N	2025-11-28 16:10:28.767336	\N	0.00	1
443	9/12 parcela Forex 	\N	\N	saida	475.00	pago	\N	2025-10-09 13:50:02.274	2025-10-09 13:50:02.274	1	2025-10-09 13:50:02.442576	1	2025-10-09 13:50:02.274	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-09 13:50:02.442576	\N	0.00	1
424	Serviço de análise e resolução. Conexão Chromebooks para aplicação das provas em sala de aula. 	87	\N	entrada	800.00	pendente	\N	\N	2025-07-31 03:00:00	5	2025-09-30 15:04:44.913966	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- 31/07 – Diária técnica para revisar e otimizar a distribuição da conexão Wi-Fi, buscando melhorar a estabilidade e resolver quedas na rede da escola, com foco no atendimento aos Chromebooks. Foi refeito o gerenciamento e a distribuição do sinal, priorizando a rede dedicada aos dispositivos. Acompanhada a aplicação das provas para garantir bom funcionamento e conectividade, deixando tudo preparado para o dia seguinte.: R$ 400,00\n- 01/08 – Diária técnica para acompanhar aplicação das provas e garantir conexão estável. Identificados problemas de queda ao conectar todos os Chromebooks; aplicadas novas abordagens e soluções paliativas até contato com o suporte da EVOs (equipamentos Huawei). Ajustes realizados pelo provedor restabeleceram a rede dedicada, permitindo conclusão das provas sem falhas.: R$ 400,00\n- Valores a cima já incluso além da diária, combustível para logística Mossoró-Baraunas e alimentação.: R$ 0,00\n\n[{"name":"31/07 – Diária técnica para revisar e otimizar a distribuição da conexão Wi-Fi, buscando melhorar a estabilidade e resolver quedas na rede da escola, com foco no atendimento aos Chromebooks. Foi refeito o gerenciamento e a distribuição do sinal, priorizando a rede dedicada aos dispositivos. Acompanhada a aplicação das provas para garantir bom funcionamento e conectividade, deixando tudo preparado para o dia seguinte.","description":"31/07 – Diária técnica para revisar e otimizar a distribuição da conexão Wi-Fi, buscando melhorar a estabilidade e resolver quedas na rede da escola, com foco no atendimento aos Chromebooks. Foi refeito o gerenciamento e a distribuição do sinal, priorizando a rede dedicada aos dispositivos. Acompanhada a aplicação das provas para garantir bom funcionamento e conectividade, deixando tudo preparado para o dia seguinte.","type":"servico","unitPrice":400,"price":400,"amount":400,"quantity":1},{"name":"01/08 – Diária técnica para acompanhar aplicação das provas e garantir conexão estável. Identificados problemas de queda ao conectar todos os Chromebooks; aplicadas novas abordagens e soluções paliativas até contato com o suporte da EVOs (equipamentos Huawei). Ajustes realizados pelo provedor restabeleceram a rede dedicada, permitindo conclusão das provas sem falhas.","description":"01/08 – Diária técnica para acompanhar aplicação das provas e garantir conexão estável. Identificados problemas de queda ao conectar todos os Chromebooks; aplicadas novas abordagens e soluções paliativas até contato com o suporte da EVOs (equipamentos Huawei). Ajustes realizados pelo provedor restabeleceram a rede dedicada, permitindo conclusão das provas sem falhas.","type":"servico","unitPrice":400,"price":400,"amount":400,"quantity":1},{"name":"Valores a cima já incluso além da diária, combustível para logística Mossoró-Baraunas e alimentação.","description":"Valores a cima já incluso além da diária, combustível para logística Mossoró-Baraunas e alimentação.","type":"servico","unitPrice":0.001,"price":0.001,"amount":0.001,"quantity":1}]	270	800.00	0.00	[{"name":"31/07 – Diária técnica para revisar e otimizar a distribuição da conexão Wi-Fi, buscando melhorar a estabilidade e resolver quedas na rede da escola, com foco no atendimento aos Chromebooks. Foi refeito o gerenciamento e a distribuição do sinal, priorizando a rede dedicada aos dispositivos. Acompanhada a aplicação das provas para garantir bom funcionamento e conectividade, deixando tudo preparado para o dia seguinte.","amount":400,"quantity":1,"type":"servico"},{"name":"01/08 – Diária técnica para acompanhar aplicação das provas e garantir conexão estável. Identificados problemas de queda ao conectar todos os Chromebooks; aplicadas novas abordagens e soluções paliativas até contato com o suporte da EVOs (equipamentos Huawei). Ajustes realizados pelo provedor restabeleceram a rede dedicada, permitindo conclusão das provas sem falhas.","amount":400,"quantity":1,"type":"servico"},{"name":"Valores a cima já incluso além da diária, combustível para logística Mossoró-Baraunas e alimentação.","amount":0.001,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-09-30 15:04:44.913966	\N	0.00	1
478	Visita técnica para localizar e refazer conectores do cabo de rede setor Almoxarifado, Ana Paula. 	56	\N	entrada	150.00	pendente	\N	\N	2025-09-10 03:00:00	5	2025-10-22 04:29:21.860296	\N	\N	\N	\N	\N	\N	239	150.00	0.00	[{"name":"Visita técnica para localizar e refazer conectores do cabo de rede setor Almoxarifado, Ana Paula. ","amount":150,"type":"servico"}]	[]	\N	\N	2025-10-22 04:29:21.860296	\N	0.00	1
1197	Gift card Júnior Mendonça ativação Google drive	\N	\N	saida	100.00	pago	\N	2025-12-05 09:24:00.518	2025-12-05 09:23:46.823	1	2025-12-05 09:24:00.971	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-05 09:23:47.107821	\N	0.00	1
1254	Parcela 1 - Manutenção nos três computadores do escritório	31	273	entrada	850.00	pago	\N	2026-01-05 18:19:35.059	2026-01-05 18:19:19.566	1	2026-01-05 18:19:35.342	1	\N	1253	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-05 18:19:19.582586	\N	0.00	1
1272	Testes	63	\N	entrada	200.00	pendente	\N	\N	2026-01-15 18:08:33.283	1	2026-01-15 18:08:33.590746	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-15 18:08:33.590746	\N	0.00	1
200	Visita técnica para analisar PC TeleAtendimento (Rayane). Retorno.	8	\N	entrada	0.01	pendente	\N	\N	2025-07-23 03:00:00	5	2025-08-03 14:41:56.779	\N	\N	\N	\N	\N	Visita técnica cortesia para resolver alguns detalhes. Retorno Pc Rayane Wpp, colocamos coringa e o Pc trouxemos para analisar. Troca da impressora sala 3. Ajuste placa de vídeo rosado.	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
202	Pagamento referente a contratação da nuvem Google driver para armazenamento protegido dos backups dos bancos de dados dos sistemas. 	8	\N	entrada	99.00	pendente	\N	\N	2025-07-31 03:00:00	5	2025-08-03 15:06:28.603	\N	\N	\N	\N	\N	Pagamento referente a contratação da nuvem Google driver, para armazenamento protegido dos backups dos bancos de dados.	147	99.00	0.00	[{"name":"Pagamento referente a contratação da nuvem Goog...","amount":99,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
251	Upgrade de memória no desktop do financeiro. Foi acrescentado +4GB de memória RAM, Totalizando 6GB. Serviço + Memória.	56	\N	entrada	250.00	pendente	\N	\N	2025-08-13 03:00:00	5	2025-08-21 00:18:47.59444	\N	\N	\N	\N	\N	\N	190	250.00	0.00	[{"name":"Upgrade de memória no desktop do financeiro. Foi acrescentado +4GB de memória RAM, Totalizando 6GB. Serviço + Memória.","amount":250,"type":"servico"}]	[]	\N	\N	2025-08-21 00:18:47.59444	\N	0.00	1
37	Acesso remoto para fazer cópia dos arquivos do usuário de um notebook para outro. Solicitação Nayara.\n\nDiscriminação de valores:\n\nServiços:\n- Acesso remoto para fazer cópia dos arquivos do usuário de um notebook para outro. Solicitação Nayara. : R$ 80,00\n\n[{"name":"Acesso remoto para fazer cópia dos arquivos do usuário de um notebook para outro. Solicitação Nayara. ","description":"Acesso remoto para fazer cópia dos arquivos do usuário de um notebook para outro. Solicitação Nayara. ","type":"servico","price":80,"amount":80,"quantity":1}]	37	\N	entrada	80.00	pendente	\N	\N	2025-07-19 03:00:00	1	2025-07-29 12:53:22.566	\N	\N	\N	\N	\N	Acesso remoto com Nayara, cópia dos arquivos. 	53	80.00	0.00	[{"name":"Acesso remoto para fazer cópia dos arquivos do usuário de um notebook para outro. Solicitação Nayara. ","amount":80,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
1172	Visita técnica Impressora	143	\N	entrada	100.00	pendente	\N	\N	2025-11-28 14:08:29.195	1	2025-11-29 10:48:22.319	\N	\N	\N	\N	\N	Visita técnica Impressora\n\nDiscriminação de valores:\n\nServiços:\n- Visita técnica para instalar e configurar impressora HP na rede Wi-fi e mapear nos dois notebooks da recepção.: R$ 100,00\n\n[{"name":"Visita técnica para instalar e configurar impressora HP na rede Wi-fi e mapear nos dois notebooks da recepção.","amount":100,"quantity":1,"type":"servico"}]	488	100.00	0.00	[{"name":"Visita técnica para instalar e configurar impressora HP na rede Wi-fi e mapear nos dois notebooks da recepção.","amount":100,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-11-28 14:08:29.214547	\N	0.00	9
119	Desktop Contabilidade. Expanção da capacidade de armazenamento. SSD 512 GB + windows e programas.\n\nDiscriminação de valores:\n\nServiços:\n- Instalação windows e demais programas e ajustes no sistema operacional: R$ 150,00\n\nProdutos/Materiais:\n- SSD 512 GB Lenovo: R$ 380,00\n\n[{"name":"Instalação windows e demais programas e ajustes no sistema operacional","amount":150,"type":"servico"},{"name":"SSD 512 GB Lenovo","amount":380,"type":"produto"}]	56	\N	entrada	530.00	pendente	\N	\N	2025-07-08 03:00:00	5	2025-07-30 12:14:29.159955	\N	\N	\N	\N	\N	SSD 512 GB + windows e programas	129	150.00	380.00	[{"name":"Instalação windows e demais programas e ajustes no sistema operacional","amount":150,"type":"servico"}]	[{"name":"SSD 512 GB Lenovo","amount":380,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
252	Reparo na placa mãe e substituição da tela	65	\N	entrada	610.00	pago	\N	2025-08-21 05:05:17.681	2025-07-28 03:00:00	1	2025-08-21 05:05:20.842	5	\N	\N	\N	\N	Máquina não dá vídeo. Kelvin já analisou mas constatou que é a placa mãe. Levar pra JCA. 	36	610.00	0.00	[{"name":"Reparo na placa mãe e substituição da tela","amount":610,"type":"servico"}]	[]	\N	\N	2025-08-21 00:19:18.377348	\N	0.00	1
444	Mensalidade do sistema 	\N	\N	saida	160.00	pago	\N	2025-10-09 13:50:19.561	2025-10-09 13:50:19.561	1	2025-10-09 13:50:19.726839	1	2025-10-09 13:50:19.561	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-09 13:50:19.726839	\N	0.00	1
168	Parcela 1/5 - Roteador Intelbras configurado com a rede clientes na João da Escóssia.\n\nDiscriminação de valores:\n\nProdutos/Materiais:\n- Roteador Intelbras configurado com a rede clientes na João da Escóssia. : R$ 150,00\n\n[{"name":"Roteador Intelbras configurado com a rede clientes na João da Escóssia. ","amount":150,"type":"produto"}]	28	\N	entrada	30.00	pago	2025-07-31 03:00:00	2025-07-31 11:44:57.056	2025-07-31 03:00:00	1	2025-07-31 11:44:57.518	5	\N	100	1	5	\N	66	0.00	150.00	[]	[{"name":"Roteador Intelbras configurado com a rede clientes na João da Escóssia. ","amount":150,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
27	Kit Dell: Desktop Dell Optplex 3010.\nProcessador Corei3. 8gb de memoria RAM. SSD 128GB.\nMonitor DELL 19 Polegadas.\nMouse e teclado Dell com Fio.	71	\N	entrada	1500.00	parcial	\N	\N	2025-07-14 17:55:50.579544	5	2025-08-26 15:29:22.824	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
271	Pedro Velho, Visita técnica para verificar problema de impressão. Cabo USB com defeito. Cabo foi trocado e impressora resolvida. 	28	\N	entrada	130.00	pendente	\N	\N	2025-08-29 01:03:22.547	5	2025-08-29 01:06:15.164174	\N	\N	\N	\N	\N	\N	202	130.00	0.00	[{"name":"Pedro Velho, Visita técnica para verificar problema de impressão. Cabo USB com defeito. Cabo foi trocado e impressora resolvida. ","amount":130,"type":"servico"}]	[]	\N	\N	2025-08-29 01:06:15.164174	\N	0.00	1
272	Impressora com erro geral.	98	\N	entrada	100.00	pendente	\N	\N	2025-08-28 15:33:17.066	5	2025-08-29 01:06:29.14516	\N	\N	\N	\N	\N	\N	197	100.00	0.00	[{"name":"Impressora com erro geral.","amount":100,"type":"servico"}]	[]	\N	\N	2025-08-29 01:06:29.14516	\N	0.00	1
276	Acesso remoto notebook Eventos, para resolver problema no microfone que estava desativado e ativação do windows. 	56	\N	entrada	60.00	pendente	\N	\N	2025-09-01 12:09:11.426	5	2025-09-01 12:09:22.449836	\N	\N	\N	\N	\N	\N	207	60.00	0.00	[{"name":"Acesso remoto notebook Eventos, para resolver problema no microfone que estava desativado e ativação do windows. ","amount":60,"type":"servico"}]	[]	\N	\N	2025-09-01 12:09:22.449836	\N	0.00	1
293	Visita técnica para fazer ajustes impressora Financeiro e Recepção. 	101	\N	entrada	100.00	pendente	\N	\N	2025-09-02 03:00:00	5	2025-09-10 03:56:29.268051	\N	\N	\N	\N	\N	\N	208	100.00	0.00	[{"name":"Visita técnica para fazer ajustes impressora Financeiro e Recepção. ","amount":100,"type":"servico"}]	[]	\N	\N	2025-09-10 03:56:29.268051	\N	0.00	1
294	Desktop Daniel, Almoxarifado. Troca da fonte de alimentação e  Carcaça/CPU. 	56	\N	entrada	270.00	pendente	\N	\N	2025-09-02 03:00:00	5	2025-09-10 03:59:28.118497	\N	\N	\N	\N	\N	\N	212	270.00	0.00	[{"name":"Desktop Daniel, Almoxarifado. Troca da fonte de alimentação e  Carcaça/CPU. ","amount":270,"type":"servico"}]	[]	\N	\N	2025-09-10 03:59:28.118497	\N	0.00	1
47	SSD com defeito - garantia	77	\N	entrada	0.00	pendente	\N	\N	2025-07-24 15:50:21.542862	1	2025-07-24 15:50:21.542862	\N	\N	\N	\N	\N	Pc na tela de BIOS. Garantia do serviço.	58	0.00	0.00	[{"name":"SSD com defeito - garantia","amount":0,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
257	Pgto mercado pago: tela Valeska 268 + chip IMP sentidos 45 + teclado Alexnutrinow 136.	\N	\N	saida	449.00	pago	\N	2025-08-21 05:02:37.356	2025-08-20 03:00:00	5	2025-08-21 05:13:14.247	9	2025-08-21 05:02:37.356	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-08-21 05:02:37.526656	\N	0.00	1
298	Notebook Sony Vaio – Substituição do teclado e reparo na carcaça. Serviço + peça.	3	\N	entrada	360.00	pendente	\N	\N	2025-07-03 03:00:00	1	2025-09-10 04:03:15.034482	\N	\N	\N	\N	\N	\N	142	360.00	0.00	[{"name":"Notebook Sony Vaio – Substituição do teclado e reparo na carcaça. Serviço + peça.","amount":360,"type":"servico"}]	[]	\N	\N	2025-09-10 04:03:15.034482	\N	0.00	1
1273	Testes	63	\N	entrada	500.00	pendente	\N	\N	2025-12-01 03:00:00	1	2026-01-15 18:09:49.919	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-12-01 03:00:00	\N	0.00	1
1274	SSD 256gb gordinho Charles	\N	\N	saida	150.00	pago	\N	2026-01-16 12:30:57.313	2026-01-16 12:30:48.921	1	2026-01-16 12:30:56.935	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-16 12:30:49.201598	\N	0.00	1
51	Parcela 1 - Serviço -\n\nDiscriminação de valores:\n\nServiços:\n- Diagnóstico e manutenção na infraestrutura de rede, com foco em melhorias de desempenho. Identificados e corrigidos pontos de limitação na conexão causados por equipamentos e conectores inadequados. Realizada a instalação de roteador Gigabit no 1º andar, passagem de cabo de rede para o PC do Lucas e substituição da tomada RJ45 no quarto do Thiago.: R$ 250,00\n\nProdutos/Materiais:\n- 5m Cabos de rede Cat5.E 100% Cobre.: R$ 25,00\n- Tomada de Rede CAT6 Tramontina.: R$ 40,00\n- Roteador Intelbras Giga W6. : R$ 250,00\n\n[{"name":"5m Cabos de rede Cat5.E 100% Cobre.","amount":25,"type":"produto"},{"name":"Tomada de Rede CAT6 Tramontina.","amount":40,"type":"produto"},{"name":"Diagnóstico e manutenção na infraestrutura de rede, com foco em melhorias de desempenho. Identificados e corrigidos pontos de limitação na conexão causados por equipamentos e conectores inadequados. Realizada a instalação de roteador Gigabit no 1º andar, passagem de cabo de rede para o PC do Lucas e substituição da tomada RJ45 no quarto do Thiago.","description":"Diagnóstico e manutenção na infraestrutura de rede, com foco em melhorias de desempenho. Identificados e corrigidos pontos de limitação na conexão causados por equipamentos e conectores inadequados. Realizada a instalação de roteador Gigabit no 1º andar, passagem de cabo de rede para o PC do Lucas e substituição da tomada RJ45 no quarto do Thiago.","type":"servico","price":250,"amount":250,"quantity":1},{"name":"Roteador Intelbras Giga W6. ","description":"Roteador Intelbras Giga W6. ","type":"produto","price":250,"amount":250,"quantity":1}]	70	\N	entrada	200.00	pago	\N	2025-07-28 13:04:49.996	2025-07-28 13:04:50.015159	1	2025-07-28 13:04:50.015159	5	\N	26	1	3	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
186	ROTINA DE BACKUP DOS BANCO DE DADOS.	8	\N	entrada	100.00	pendente	\N	\N	2025-07-01 03:00:00	5	2025-08-03 12:57:04.818	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
197	ROTINA DE BACKUP DOS BANCO DE DADOS.	8	\N	entrada	100.00	pendente	\N	\N	2025-08-01 03:00:00	5	2025-08-03 13:16:05.374	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
49	Manutenção preventiva completa em Pc gamer\n\nDiscriminação de valores:\n\nServiços:\n- Manutenção preventiva Pc gamer completo: R$ 150,00\n- Substituição placa mãe, processador, cooler e memórias RAM + instalação windows 10: R$ 150,00\n\n[{"name":"Manutenção preventiva Pc gamer completo","description":"Manutenção preventiva Pc gamer completo","type":"servico","price":150,"amount":150,"quantity":1},{"name":"Substituição placa mãe, processador, cooler e memórias RAM + instalação windows 10","description":"Substituição placa mãe, processador, cooler e memórias RAM + instalação windows 10","type":"servico","price":150,"amount":150,"quantity":1}]	10	\N	entrada	300.00	pago	\N	2025-07-28 11:36:58.688	2025-07-25 03:00:00	1	2025-07-29 02:24:35.587	1	\N	\N	\N	\N	Buscar Pc para fazer geral.\nLimpeza interna, desoxidação das placas e troca da pasta térmica. Instalação de placa mãe nova, processador e memória. Instalação do sistema e programas. 	9	300.00	0.00	[{"name":"Manutenção preventiva Pc gamer completo","amount":150,"type":"servico"},{"name":"Substituição placa mãe, processador, cooler e memórias RAM + instalação windows 10","amount":150,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
214	4x digisparks	\N	\N	saida	120.00	pago	\N	2025-08-09 09:05:27.9	2025-08-09 09:05:27.9	1	2025-08-09 09:05:28.069543	1	2025-08-09 09:05:27.9	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
496	Manutenção geral em impressora grande porte. Limpeza interna e lubrificação, manutenção na unidade de fusão, manutenção sistema do scaner e troca da lâmpada. Troca do toner e DR. 	127	323	entrada	450.00	pendente	\N	\N	2025-07-23 03:00:00	5	2025-10-31 15:42:39.358469	\N	\N	\N	\N	\N	\N	327	450.00	0.00	[{"name":"Manutenção geral em impressora grande porte. Limpeza interna e lubrificação, manutenção na unidade de fusão, manutenção sistema do scaner e troca da lâmpada. Troca do toner e DR. ","amount":450,"type":"servico"}]	[]	\N	\N	2025-10-31 15:42:39.358469	\N	0.00	1
501	Manutenção Desktop - limpeza interna e desoxidação das memórias. 	127	326	entrada	150.00	pendente	\N	\N	2025-08-21 03:00:00	5	2025-11-05 03:11:03.417	\N	\N	\N	\N	\N		330	150.00	0.00	[{"name":"Manutenção Desktop - limpeza interna e desoxidação das memórias. ","amount":150,"type":"servico"}]	[]	\N	\N	2025-10-31 15:58:54.784489	\N	0.00	1
512	ROTINA DE BACKUP DOS BANCO DE DADOS.	8	345	entrada	100.00	pendente	\N	\N	2025-10-01 03:00:00	5	2025-11-11 19:47:10.720154	\N	\N	\N	\N	\N	\N	342	100.00	0.00	[{"name":"ROTINA DE BACKUP DOS BANCO DE DADOS.","amount":100,"type":"servico"}]	[]	\N	\N	2025-11-11 19:47:10.720154	\N	0.00	1
111	Comanda prime	82	\N	entrada	800.00	pago	\N	2025-07-30 22:59:05.052	2025-07-29 03:00:00	1	2025-07-30 22:59:03.294	1	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
445	4/12 sistema inicial 	\N	\N	saida	100.00	pago	\N	2025-10-09 13:50:39.225	2025-10-09 13:50:39.225	1	2025-10-09 13:50:39.397049	1	2025-10-09 13:50:39.225	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-09 13:50:39.397049	\N	0.00	1
105	Visita técnica ajustes impressora PDV 3 e acesso a banco Pc diretoria \n\nDiscriminação de valores:\n\nServiços:\n- Visita técnica para deixar impressora do PDV3 e Ajuste no acesso do banco Bradesco Pc Alcilene.: R$ 100,00\n\n[{"name":"Visita técnica para deixar impressora do PDV3 e Ajuste no acesso do banco Bradesco Pc Alcilene.","amount":100,"type":"servico"}]	67	\N	entrada	100.00	pendente	\N	\N	2025-07-28 03:00:00	1	2025-07-29 02:53:15.101	\N	\N	\N	\N	\N	Serviço -	120	100.00	0.00	[{"name":"Visita técnica para deixar impressora do PDV3 e Ajuste no acesso do banco Bradesco Pc Alcilene.","amount":100,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
114	Visita técnica reparo no cabo de rede do DVR \n\nDiscriminação de valores:\n\nServiços:\n- Ajustes na rede do DVR com substituição conectores RJ45: R$ 100,00\n\n[{"name":"Ajustes na rede do DVR com substituição conectores RJ45","amount":100,"type":"servico"}]	5	\N	entrada	100.00	pago	\N	2025-07-31 11:45:36.495	2025-07-28 03:00:00	1	2025-07-31 11:45:37.085	5	\N	\N	\N	\N	\N	21	100.00	0.00	[{"name":"Ajustes na rede do DVR com substituição conectores RJ45","amount":100,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
104	Reparo na tomada de rede CPU recepção\n\nDiscriminação de valores:\n\nServiços:\n- Visita técnica para identificar e resolver problema de rede na recepção. Foi identificado problema na tomada RJ45. Tomada refeita.: R$ 100,00\n\n[{"name":"Visita técnica para identificar e resolver problema de rede na recepção. Foi identificado problema na tomada RJ45. Tomada refeita.","amount":100,"type":"servico"}]	63	\N	entrada	100.00	pago	\N	2025-07-31 11:45:50.247	2025-07-28 03:00:00	1	2025-07-31 11:45:50.843	5	\N	\N	\N	\N	\N	20	100.00	0.00	[{"name":"Visita técnica para identificar e resolver problema de rede na recepção. Foi identificado problema na tomada RJ45. Tomada refeita.","amount":100,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
176	Visita técnica na sexta-feira para análise do computador da recepção (Guichê 1), encaminhado à assistência para diagnóstico. Identificado problema no telefone do guichê, que foi substituído por unidade reserva.\nNo sábado, realizada a reinstalação do computador com o problema resolvido após a troca da fonte de alimentação. Serviço incluiu mão de obra e peça.	8	\N	entrada	270.00	pendente	\N	\N	2025-08-02 03:00:00	5	2025-08-03 11:53:30.928	\N	\N	\N	\N	\N		141	270.00	0.00	[{"name":"Visita técnica na sexta-feira para análise do computador da recepção (Guichê 1), encaminhado à assistência para diagnóstico. Identificado problema no telefone do guichê, que foi substituído por unidade reserva.\\nNo sábado, realizada a reinstalação do computador com o problema resolvido após a troca da fonte de alimentação. Serviço incluiu mão de obra e peça.","amount":270,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
509	Suporte remoto para ajustes na configuração do acesso ao sistema de câmeras e gravações.	14	\N	entrada	50.00	pago	\N	2026-01-05 17:33:46.076	2025-11-06 13:35:34.63	1	2026-01-05 17:33:46.114	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-06 13:35:34.779812	\N	0.00	1
33	Mão de obra especializada. Análise e diagnóstico dos equipamentos. Montagem, instalação/configuração de todo sistema de CFTV + orientação do uso.\n\nDiscriminação de valores:\n\nServiços:\n- Mão de obra especializada. Análise e diagnóstico dos equipamentos. Montagem, instalação/configuração de todo sistema de CFTV + orientação do uso.: R$ 350,00\n\nProdutos/Materiais:\n- DVR Intelbras 4 Canais. : R$ 500,00\n- Câmera Motorola HD. : R$ 150,00\n- 2x Par conector Video Ballun Intelbras. : R$ 45,00\n- 3x Conector P4 (Alimentação Câmeras ): R$ 15,00\n\n[{"name":"DVR Intelbras 4 Canais. ","amount":500,"type":"produto"},{"name":"Câmera Motorola HD. ","amount":150,"type":"produto"},{"name":"2x Par conector Video Ballun Intelbras. ","amount":45,"type":"produto"},{"name":"3x Conector P4 (Alimentação Câmeras )","amount":15,"type":"produto"},{"name":"Mão de obra especializada. Análise e diagnóstico dos equipamentos. Montagem, instalação/configuração de todo sistema de CFTV + orientação do uso.","description":"Mão de obra especializada. Análise e diagnóstico dos equipamentos. Montagem, instalação/configuração de todo sistema de CFTV + orientação do uso.","type":"servico","price":350,"amount":350,"quantity":1}]	7	\N	entrada	1060.00	pendente	\N	\N	2025-07-18 03:00:00	1	2025-07-29 12:55:02.986	\N	\N	\N	\N	\N	Serviço -	47	350.00	710.00	[{"name":"Não de obra especializada. Análise e diagnóstico dos equipamentos. Montagem, instalação/configuração de todo sistema de CFTV + orientação do uso.","amount":350,"type":"servico"}]	[{"name":"DVR Intelbras 4 Canais. ","amount":500,"type":"produto"},{"name":"Câmera Motorola HD. ","amount":150,"type":"produto"},{"name":"2x Par conector Video Ballun Intelbras. ","amount":45,"type":"produto"},{"name":"3x Conector P4 (Alimentação Câmeras )","amount":15,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
452	Computador não inicializa	116	279	entrada	120.00	pago	\N	2025-10-11 15:37:39.919	2025-10-11 03:00:00	1	2025-10-11 15:37:39.801	1	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Manutenção preventiva com desoxidação dos slots da placa mãe, substituição de pasta térmica e revisão do sistema de resfriamento.: R$ 50,00\n- Visita técnica e diagnóstico de CPU: R$ 70,00\n\n[{"name":"Manutenção preventiva com desoxidação dos slots da placa mãe, substituição de pasta térmica e revisão do sistema de resfriamento.","description":"Manutenção preventiva com desoxidação dos slots da placa mãe, substituição de pasta térmica e revisão do sistema de resfriamento.","type":"servico","unitPrice":50,"price":50,"amount":50,"quantity":1},{"name":"Visita técnica e diagnóstico de CPU","description":"Visita técnica e diagnóstico de CPU","type":"servico","unitPrice":70,"price":70,"amount":70,"quantity":1}]	289	120.00	0.00	[{"name":"Manutenção preventiva com desoxidação dos slots da placa mãe, substituição de pasta térmica e revisão do sistema de resfriamento.","amount":50,"quantity":1,"type":"servico"},{"name":"Visita técnica e diagnóstico de CPU","amount":70,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-10-11 13:45:54.890616	\N	0.00	1
497	Impressora Epson L5190 - retorno impressora falhando. Nova manutenção. Resolvido. Não gerou custo. 	127	321	entrada	0.00	pendente	\N	\N	2025-07-23 03:00:00	5	2025-10-31 15:42:59.503438	\N	\N	\N	\N	\N	\N	325	0.00	0.00	[{"name":"Impressora Epson L5190 - retorno impressora falhando. Nova manutenção. Resolvido. Não gerou custo. ","amount":0,"type":"servico"}]	[]	\N	\N	2025-10-31 15:42:59.503438	\N	0.00	1
446	2/3 rolo de fibra óptica	\N	\N	saida	100.00	pago	\N	2025-10-09 13:51:13.986	2025-10-09 13:51:13.986	1	2025-10-09 13:51:14.144554	1	2025-10-09 13:51:13.986	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-09 13:51:14.144554	\N	0.00	1
278	Testes no HD externo e ajustes sistema doctors via remoto + reparo impressora Canon\n\nDiscriminação de valores:\n\nServiços:\n- Acesso remoto ajustes doctors : R$ 50,00\n- Manutenção CPU Detran. Limpeza interna e troca de bateria CMOS.: R$ 100,00\n- Manutenção impressora Canon com remoção de ar e ajustes na cabeça de impressão.: R$ 150,00\n- Ajustes no roteador da rede CEOM_INT e testes na impressora e maquinas: R$ 80,00\n\n[{"name":"Acesso remoto ajustes doctors ","description":"Acesso remoto ajustes doctors ","type":"servico","price":50,"amount":50,"quantity":1},{"name":"Manutenção CPU Detran. Limpeza interna e troca de bateria CMOS.","description":"Manutenção CPU Detran. Limpeza interna e troca de bateria CMOS.","type":"servico","price":100,"amount":100,"quantity":1},{"name":"Manutenção impressora Canon com remoção de ar e ajustes na cabeça de impressão.","description":"Manutenção impressora Canon com remoção de ar e ajustes na cabeça de impressão.","type":"servico","price":150,"amount":150,"quantity":1},{"name":"Ajustes no roteador da rede CEOM_INT e testes na impressora e maquinas","description":"Ajustes no roteador da rede CEOM_INT e testes na impressora e maquinas","type":"servico","price":80,"amount":80,"quantity":1}]	26	\N	entrada	380.00	pago	\N	2025-09-11 18:20:57.435	2025-07-28 03:00:00	1	2025-09-11 18:21:00.018	1	\N	\N	\N	\N	02/07/2025 - Passar lá na clínica para pegar HD externo para análise. Parece que o disco está com problemas físicos.	4	380.00	0.00	[{"name":"Acesso remoto ajustes doctors ","amount":50,"type":"servico"},{"name":"Manutenção CPU Detran. Limpeza interna e troca de bateria CMOS.","amount":100,"type":"servico"},{"name":"Manutenção impressora Canon com remoção de ar e ajustes na cabeça de impressão.","amount":150,"type":"servico"},{"name":"Ajustes no roteador da rede CEOM_INT e testes na impressora e maquinas","amount":80,"type":"servico"}]	[]	\N	\N	2025-09-03 19:43:25.602199	\N	0.00	1
354	Suporte técnico em informática, manutenção de rede e ajustes nos computadores	11	\N	entrada	1930.00	pago	\N	2025-09-11 15:54:23.148	2025-09-06 01:34:10.681	1	2025-09-11 15:54:23.233	1	\N	\N	\N	\N	Suporte técnico em informática, manutenção de rede e ajustes nos computadores\n\nDiscriminação de valores:\n\nServiços:\n- Upgrade de memória RAM notebook Max: R$ 80,00\n- Instalação de tomada de rede e cabo de rede na sala de abate: R$ 150,00\n- Reparo na estrutura de rede da sala de abate e ajustes na configuração do roteador: R$ 200,00\n\nProdutos/Materiais:\n- Tomada RJ45 sala de abate: R$ 40,00\n- Memória RAM DDR4 8GB notebook Max: R$ 220,00\n- Impressora HP M1132 sala diretoria: R$ 950,00\n- Transformador 1500 VA impressora HP m1132: R$ 250,00\n- 10x Cabo de rede RJ45 (R$ 4,00 cada): R$ 40,00\n\n[{"name":"Upgrade de memória RAM notebook Max","amount":80,"quantity":1,"type":"servico"},{"name":"Instalação de tomada de rede e cabo de rede na sala de abate","amount":150,"quantity":1,"type":"servico"},{"name":"Reparo na estrutura de rede da sala de abate e ajustes na configuração do roteador","amount":200,"quantity":1,"type":"servico"},{"name":"Tomada RJ45 sala de abate","amount":40,"quantity":1,"type":"produto"},{"name":"Memória RAM DDR4 8GB notebook Max","amount":220,"quantity":1,"type":"produto"},{"name":"Impressora HP M1132 sala diretoria","amount":950,"quantity":1,"type":"produto"},{"name":"Transformador 1500 VA impressora HP m1132","amount":250,"quantity":1,"type":"produto"},{"name":"Cabo de rede RJ45","amount":40,"quantity":10,"type":"produto"}]	224	430.00	1500.00	[{"name":"Upgrade de memória RAM notebook Max","amount":80,"quantity":1,"type":"servico"},{"name":"Instalação de tomada de rede e cabo de rede na sala de abate","amount":150,"quantity":1,"type":"servico"},{"name":"Reparo na estrutura de rede da sala de abate e ajustes na configuração do roteador","amount":200,"quantity":1,"type":"servico"}]	[{"name":"Tomada RJ45 sala de abate","amount":40,"quantity":1,"type":"produto"},{"name":"Memória RAM DDR4 8GB notebook Max","amount":220,"quantity":1,"type":"produto"},{"name":"Impressora HP M1132 sala diretoria","amount":950,"quantity":1,"type":"produto"},{"name":"Transformador 1500 VA impressora HP m1132","amount":250,"quantity":1,"type":"produto"},{"name":"Cabo de rede RJ45","amount":40,"quantity":10,"type":"produto"}]	\N	\N	2025-09-11 15:22:25.528135	\N	0.00	1
352	CPU recepção lenta. Pegar máquina para análise.	26	\N	entrada	170.00	pago	\N	2025-09-12 14:44:51.682	2025-09-06 01:35:41.573	1	2025-09-12 14:44:51.741	1	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Manutenção preventiva com pasta térmica em CPU : R$ 70,00\n\nProdutos/Materiais:\n- Memória 4gb DDR 3: R$ 100,00\n\n[{"name":"Manutenção preventiva com pasta térmica em CPU ","description":"Manutenção preventiva com pasta térmica em CPU ","type":"servico","unitPrice":70,"price":70,"amount":70,"quantity":1},{"name":"Memória 4gb DDR 3","description":"Memória 4gb DDR 3","type":"produto","unitPrice":100,"price":100,"amount":100,"quantity":1}]	226	70.00	100.00	[{"name":"Manutenção preventiva com pasta térmica em CPU ","amount":70,"quantity":1,"type":"servico"}]	[{"name":"Memória 4gb DDR 3","amount":100,"quantity":1,"type":"produto"}]	\N	\N	2025-09-10 17:31:28.754005	\N	0.00	1
43	 Acesso remoto e contato com o suporte da Locaweb para resolver problema nos emails\n\nDiscriminação de valores:\n\nServiços:\n- 16/07 Acesso remoto e contato com o suporte da Locaweb para resolver problema nos emails apos intervenção do pessoal da agência no site.  Apontamentos DNS refeito. : R$ 100,00\n\n[{"name":"16/07 Acesso remoto e contato com o suporte da Locaweb para resolver problema nos emails apos intervenção do pessoal da agência no site.  Apontamentos DNS refeito. ","description":"16/07 Acesso remoto e contato com o suporte da Locaweb para resolver problema nos emails apos intervenção do pessoal da agência no site.  Apontamentos DNS refeito. ","type":"servico","price":100,"amount":100,"quantity":1}]	56	\N	entrada	100.00	pendente	\N	\N	2025-07-21 03:00:00	1	2025-07-29 12:53:02.833	\N	\N	\N	\N	\N	16/07 Acesso remoto e contato com o suporte da Locaweb para resolver problema nos emails apos intervenção do pessoal da agência no site. 	56	100.00	0.00	[{"name":"16/07 Acesso remoto e contato com o suporte da Locaweb para resolver problema nos emails apos intervenção do pessoal da agência no site.  Apontamentos DNS refeito. ","amount":100,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
353	Notebook para manutenção	83	\N	entrada	350.00	pago	\N	2025-09-11 13:40:58.839	2025-09-06 01:35:38.704	1	2025-09-11 13:40:58.959	1	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Instalação da memória e ajustes no sistema operacional: R$ 130,00\n\nProdutos/Materiais:\n- Memória ddr4 8gb: R$ 220,00\n\n[{"name":"Memória ddr4 8gb","description":"Memória ddr4 8gb","type":"produto","unitPrice":220,"price":220,"amount":220,"quantity":1},{"name":"Instalação da memória e ajustes no sistema operacional","description":"Instalação da memória e ajustes no sistema operacional","type":"servico","unitPrice":130,"price":130,"amount":130,"quantity":1}]	225	130.00	220.00	[{"name":"Instalação da memória e ajustes no sistema operacional","amount":130,"quantity":1,"type":"servico"}]	[{"name":"Memória ddr4 8gb","amount":220,"quantity":1,"type":"produto"}]	\N	\N	2025-09-10 17:31:59.421303	\N	0.00	1
36	Visita técnica cortesia para resolver alguns detalhes. Retorno Pc Rayane Wpp, colocamos coringa e o Pc trouxemos para analisar. Troca da impressora sala 3. Ajuste placa de vídeo rosado.	8	\N	entrada	0.01	pendente	\N	\N	2025-07-16 03:00:00	5	2025-08-03 14:44:57.806	\N	\N	\N	\N	\N	Visita técnica cortesia para resolver alguns detalhes. Retorno Pc Rayane Wpp, colocamos coringa e o Pc trouxemos para analisar. Troca da impressora sala 3. Ajuste placa de vídeo rosado.	52	0.10	0.00	[{"name":"Visita técnica cortesia para resolver alguns detalhes. Retorno Pc Rayane Wpp, colocamos coringa e o Pc trouxemos para analisar. Troca da impressora sala 3. Ajuste placa de vídeo rosado.","amount":0.1,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
454	Kalione restam 300	\N	\N	saida	100.00	pago	\N	2025-10-11 15:38:08.217	2025-10-11 15:38:08.217	1	2025-10-11 15:38:10.384437	1	2025-10-11 15:38:08.217	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-11 15:38:10.384437	\N	0.00	1
480	Visita técnica de manhã e a tarde em conjunto com alguns acessos remotos para identificar problema na internet da escola. Constatamos que era um problema no link. Em contatos com a Interjato empresa responsável pelos links, conseguimos trocar para um segundo link da escola. 	9	297	entrada	250.00	pendente	\N	\N	2025-10-13 03:00:00	5	2025-10-22 18:33:19.044	\N	\N	\N	\N	\N		307	250.00	0.00	[{"name":"Visita técnica de manhã e a tarde em conjunto com alguns acessos remotos para identificar problema na internet da escola. Constatamos que era um problema no link. Em contatos com a Interjato empresa responsável pelos links, conseguimos trocar para um segundo link da escola. ","amount":250,"type":"servico"}]	[]	\N	\N	2025-10-22 18:32:58.819124	\N	0.00	1
485	Memória Kingston DDR3 8GB 1600GHz\nVisita técnica para instalação de memória RAM emd desktop.	125	311	entrada	260.00	pendente	\N	\N	2025-10-29 15:55:59.19	5	2025-10-29 15:57:20.34542	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Visita técnica para instalação de memória RAM emd desktop.: R$ 100,00\n\nProdutos/Materiais:\n- Memória Kingston DDR3 8GB 1600GHz: R$ 160,00\n\n[{"name":"Visita técnica para instalação de memória RAM emd desktop.","description":"Visita técnica para instalação de memória RAM emd desktop.","type":"servico","unitPrice":100,"price":100,"amount":100,"quantity":1},{"name":"Memória Kingston DDR3 8GB 1600GHz","description":"Memória Kingston DDR3 8GB 1600GHz","type":"produto","unitPrice":160,"price":160,"amount":160,"quantity":1}]	314	100.00	160.00	[{"name":"Visita técnica para instalação de memória RAM emd desktop.","amount":100,"quantity":1,"type":"servico"}]	[{"name":"Memória Kingston DDR3 8GB 1600GHz","amount":160,"quantity":1,"type":"produto"}]	\N	\N	2025-10-29 15:57:20.34542	\N	0.00	1
488	Reinstalação do pacote office e ajustes no sistema operacional. Pc Lucinete. 	101	315	entrada	50.00	pendente	\N	\N	2025-10-06 03:00:00	5	2025-10-31 14:01:35.302594	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Reinstalação do pacote office e ajustes no sistema operacional. Pc Lucinete.: R$ 50,00\n\n[{"name":"Reinstalação do pacote office e ajustes no sistema operacional. Pc Lucinete.","description":"Reinstalação do pacote office e ajustes no sistema operacional. Pc Lucinete.","type":"servico","unitPrice":50,"price":50,"amount":50,"quantity":1}]	319	50.00	0.00	[{"name":"Reinstalação do pacote office e ajustes no sistema operacional. Pc Lucinete.","amount":50,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-10-31 14:01:35.302594	\N	0.00	1
498	Desktop para copiar arquivos e enviar para Jéssica.	127	322	entrada	50.00	pendente	\N	\N	2025-08-01 03:00:00	5	2025-10-31 15:43:12.147379	\N	\N	\N	\N	\N	\N	326	50.00	0.00	[{"name":"Desktop para copiar arquivos e enviar para Jéssica.","amount":50,"type":"servico"}]	[]	\N	\N	2025-10-31 15:43:12.147379	\N	0.00	1
378	Serviço - 	66	\N	entrada	150.00	pendente	\N	\N	2025-07-28 13:20:07.653	1	2025-09-12 14:29:42.130689	\N	\N	\N	\N	\N	Máquina liga sem vídeo. Kelvin analisou e viu que o problema é placa de vídeo. Levar placa pra JCA Analisar. \n\nDiscriminação de valores:\n\nServiços:\n- Diagnóstico e resolução, limpeza interna, desoxidação das placas e troca da pasta térmica. Instalação da placa de vídeo nova. : R$ 150,00\n\n[{"name":"Diagnóstico e resolução, limpeza interna, desoxidação das placas e troca da pasta térmica. Instalação da placa de vídeo nova. ","description":"Diagnóstico e resolução, limpeza interna, desoxidação das placas e troca da pasta térmica. Instalação da placa de vídeo nova. ","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1}]	37	150.00	0.00	[{"name":"Diagnóstico e resolução, limpeza interna, desoxidação das placas e troca da pasta térmica. Instalação da placa de vídeo nova. ","amount":150,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-09-12 14:29:42.130689	\N	0.00	1
447	Kalione restam 600	\N	\N	saida	250.00	pago	\N	2025-10-09 13:51:33.981	2025-10-09 13:51:33.981	1	2025-10-09 13:51:34.146342	1	2025-10-09 13:51:33.981	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-09 13:51:34.146342	\N	0.00	1
120	Manutenção preventiva e corretiva, Notebook de uso Verônica. Troca do HD por SSD 240GB, Instalação do sistema e programas e configuração dos acessos Caixa. Troca do teclado interno que estava apresentando problemas. SSD + Teclado + Serviço. 	56	\N	entrada	570.00	pendente	\N	\N	2025-07-22 03:00:00	5	2025-07-30 12:18:27.63007	\N	\N	\N	\N	\N	\N	130	570.00	0.00	[{"name":"Manutenção preventiva e corretiva, Notebook de uso Verônica. Troca do HD por SSD 240GB, Instalação do sistema e programas e configuração dos acessos Caixa. Troca do teclado interno que estava apresentando problemas. SSD + Teclado + Serviço. ","amount":570,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
300	Visita técnica na matriz para reativar câmera IP que estava desligada e salvar as gravações do DVR referentes aos acontecimentos em questão.	3	\N	entrada	250.00	pendente	\N	\N	2025-09-10 04:28:35.291	5	2025-09-10 04:28:45.214497	\N	\N	\N	\N	\N	\N	232	250.00	0.00	[{"name":"Visita técnica na matriz para reativar câmera IP que estava desligada e salvar as gravações do DVR referentes aos acontecimentos em questão.","amount":250,"type":"servico"}]	[]	\N	\N	2025-09-10 04:28:45.214497	\N	0.00	1
1154	PC do caixa não liga.	41	\N	entrada	500.00	pendente	\N	\N	2025-11-26 01:17:10.22	1	2025-11-26 11:37:25.143	\N	\N	\N	\N	\N	PC do caixa não liga.\n\nDiscriminação de valores:\n\nServiços:\n- Substituição de placa mãe, instalação de drivers e atualizações para suportar a placa mãe nova: R$ 150,00\n\nProdutos/Materiais:\n- Placa mãe gigabyte 1150: R$ 350,00\n\n[{"name":"Substituição de placa mãe, instalação de drivers e atualizações para suportar a placa mãe nova","amount":150,"quantity":1,"type":"servico"},{"name":"Placa mãe gigabyte 1150","amount":350,"quantity":1,"type":"produto"}]	465	150.00	350.00	[{"name":"Substituição de placa mãe, instalação de drivers e atualizações para suportar a placa mãe nova","amount":150,"quantity":1,"type":"servico"}]	[{"name":"Placa mãe gigabyte 1150","amount":350,"quantity":1,"type":"produto"}]	\N	\N	2025-11-26 01:17:10.241039	\N	0.00	1
371	Dellzao + Monitor para Assis Carlos contador ABL3	64	\N	entrada	1300.00	pendente	\N	\N	2025-09-11 15:56:24.843	5	2025-09-11 15:56:35.844	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-11 15:56:25.010993	\N	0.00	1
455	Baixa com backup + adaptador áudio P2 USB 	117	\N	entrada	170.00	pago	\N	2025-10-14 18:13:45.286	2025-10-14 18:13:37.208	1	2025-10-14 18:13:45.204	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-14 18:13:39.373046	\N	0.00	1
456	Medical Center – Impressora/Scanner Wi-Fi HP seminovo. Instalação e configuração na rede sem fio, permitindo o uso das funções de digitalização a partir das duas máquinas da recepção.	28	\N	entrada	150.00	pendente	\N	\N	2025-09-22 03:00:00	5	2025-10-15 15:08:02.382373	\N	\N	\N	\N	\N	\N	252	150.00	0.00	[{"name":"Medical Center – Impressora/Scanner Wi-Fi HP seminovo. Instalação e configuração na rede sem fio, permitindo o uso das funções de digitalização a partir das duas máquinas da recepção.","amount":150,"type":"servico"}]	[]	\N	\N	2025-10-15 15:08:02.382373	\N	0.00	1
457	Pc TeleAtendimento não liga e está cheirando a queimado. \nTroca da alimentação queimada. Efetuada a troca da fonte. 	28	281	entrada	220.00	pendente	\N	\N	2025-10-15 16:06:08.955	5	2025-10-15 16:07:45.661658	\N	\N	\N	\N	\N	\N	290	220.00	0.00	[{"name":"Pc TeleAtendimento não liga e está cheirando a queimado. \\nTroca da alimentação queimada. Efetuada a troca da fonte. ","amount":220,"type":"servico"}]	[]	\N	\N	2025-10-15 16:07:45.661658	\N	0.00	1
384	Realização da mudança dos equipamentos para o andar de cima e testes nos equipamentos.	54	\N	entrada	80.00	pendente	\N	\N	2025-09-20 03:00:00	1	2025-09-20 01:29:58.928	\N	\N	\N	\N	\N		247	80.00	0.00	[{"name":"Realizar mudança de equipamentos para o andar de cima.","amount":80,"type":"servico"}]	[]	\N	\N	2025-09-20 01:26:51.613716	\N	0.00	1
458	CPU para analisar sistema tela azul e redistribuição de partições	115	267	entrada	150.00	pago	\N	2025-10-16 02:20:56.672	2025-10-08 23:00:42.151	1	2025-10-16 02:20:56.56	1	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Baixa com backup : R$ 150,00\n\n[{"name":"Baixa com backup ","description":"Baixa com backup ","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1}]	285	150.00	0.00	[{"name":"Baixa com backup ","amount":150,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-10-16 02:20:39.918091	\N	0.00	1
499	Impressora Epson L5190 - retorno. Impressora falhando. Troca da tubulação velha causando entupimento. Não gerou custo. 	127	324	entrada	0.00	pendente	\N	\N	2025-08-21 03:00:00	5	2025-10-31 15:54:49.535268	\N	\N	\N	\N	\N	\N	328	0.00	0.00	[{"name":"Impressora Epson L5190 - retorno. Impressora falhando. Troca da tubulação velha causando entupimento. Não gerou custo. ","amount":0,"type":"servico"}]	[]	\N	\N	2025-10-31 15:54:49.535268	\N	0.00	1
380	Impressora Epson com erro geral. Manutenção preventiva, limpeza interna e lubrificação. Desentupimento da cabeça de impressão, troca das almofadas e reset. 	103	\N	entrada	150.00	pendente	\N	\N	2025-09-10 03:00:00	1	2025-09-20 01:40:50.175	\N	\N	\N	\N	\N		234	150.00	0.00	[{"name":"Impressora Epson com erro geral. ","amount":150,"type":"servico"}]	[]	\N	\N	2025-09-16 20:43:06.424149	\N	0.00	1
387	Materiais para serviço de rede fibra óptica AFIM. Conectores, esticadores, fita de fixação no poste.	\N	\N	saida	133.00	pago	\N	2025-09-23 14:57:49.98	2025-09-23 14:57:49.98	1	2025-09-23 14:57:50.142264	1	2025-09-23 14:57:49.98	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-23 14:57:50.142264	\N	0.00	1
390	Parcela 2 - Parcelamento avulso materiais e serviços 	21	\N	entrada	200.00	pago	\N	2025-09-24 02:14:54.148	2025-09-24 02:14:54.148	1	2025-09-24 02:14:54.167006	1	\N	377	2	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-24 02:14:54.167006	\N	0.00	1
392	SSD 128 GB Jair para estoque	\N	\N	saida	90.00	pago	\N	2025-09-24 16:45:12.158	2025-09-24 16:45:12.158	1	2025-09-24 16:45:12.317678	1	2025-09-24 16:45:12.158	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-24 16:45:12.317678	\N	0.00	1
393	Estabilizador padrão antigo Kalione	\N	\N	saida	20.00	pago	\N	2025-09-24 19:09:24.367	2025-09-24 19:09:24.367	1	2025-09-24 19:09:24.535513	1	2025-09-24 19:09:24.367	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-24 19:09:24.535513	\N	0.00	1
169	Parcela 2/5 - Roteador Intelbras configurado com a rede clientes na João da Escóssia.\n\nDiscriminação de valores:\n\nProdutos/Materiais:\n- Roteador Intelbras configurado com a rede clientes na João da Escóssia. : R$ 150,00\n\n[{"name":"Roteador Intelbras configurado com a rede clientes na João da Escóssia. ","amount":150,"type":"produto"}]	28	\N	entrada	30.00	pendente	2025-08-31 03:00:00	\N	2025-08-31 03:00:00	1	2025-07-31 11:43:37.954925	\N	\N	100	2	5	\N	66	0.00	150.00	[]	[{"name":"Roteador Intelbras configurado com a rede clientes na João da Escóssia. ","amount":150,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
171	Parcela 4/5 - Roteador Intelbras configurado com a rede clientes na João da Escóssia.\n\nDiscriminação de valores:\n\nProdutos/Materiais:\n- Roteador Intelbras configurado com a rede clientes na João da Escóssia. : R$ 150,00\n\n[{"name":"Roteador Intelbras configurado com a rede clientes na João da Escóssia. ","amount":150,"type":"produto"}]	28	\N	entrada	30.00	pendente	2025-10-31 03:00:00	\N	2025-10-31 03:00:00	1	2025-07-31 11:43:38.057147	\N	\N	100	4	5	\N	66	0.00	150.00	[]	[{"name":"Roteador Intelbras configurado com a rede clientes na João da Escóssia. ","amount":150,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
174	SSD + Baixa CPU\n\nDiscriminação de valores:\n\nServiços:\n- Instalação do Windows e demais ajustes : R$ 150,00\n\nProdutos/Materiais:\n- SSD 128 GB: R$ 150,00\n\n[{"name":"SSD 128 GB","description":"SSD 128 GB","type":"produto","price":150,"amount":150,"quantity":1},{"name":"Instalação do Windows e demais ajustes ","description":"Instalação do Windows e demais ajustes ","type":"servico","price":150,"amount":150,"quantity":1}]	42	\N	entrada	300.00	pendente	\N	\N	2025-07-28 13:20:07.653	1	2025-08-01 03:11:08.432366	\N	\N	\N	\N	\N	Descrição aqui	139	150.00	150.00	[{"name":"Instalação do Windows e demais ajustes ","amount":150,"type":"servico"}]	[{"name":"SSD 128 GB","amount":150,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
75	Retorno PC na assistência\n\nDiscriminação de valores:\n\nServiços:\n- Retorno PC na assistência: R$ 10,00\n\n[{"name":"Retorno PC na assistência","amount":10,"type":"servico"}]	74	\N	entrada	70.00	pago	\N	2025-12-04 11:08:19.627	2025-07-20 03:00:00	1	2025-12-04 11:08:19.841	1	\N	\N	\N	\N	Retorno PC na assistência	75	10.00	0.00	[{"name":"Retorno PC na assistência","amount":10,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
100	Roteador Intelbras configurado com a rede clientes na João da Escóssia.\n\nDiscriminação de valores:\n\nProdutos/Materiais:\n- Roteador Intelbras configurado com a rede clientes na João da Escóssia. : R$ 150,00\n\n[{"name":"Roteador Intelbras configurado com a rede clientes na João da Escóssia. ","amount":150,"type":"produto"}]	28	\N	entrada	150.00	pendente	\N	\N	2025-07-24 03:00:00	1	2025-12-13 02:22:01.284	\N	\N	\N	\N	\N	Serviço -	66	0.00	150.00	[]	[{"name":"Roteador Intelbras configurado com a rede clientes na João da Escóssia. ","amount":150,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
1275	Última parcela Forex	\N	\N	saida	475.00	pago	\N	2026-01-19 11:20:26.237	2026-01-19 11:20:18.581	1	2026-01-19 11:20:25.863	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-19 11:20:18.860133	\N	0.00	1
491	Verificar lentidão na impressão. 	84	298	entrada	100.00	pendente	\N	\N	2025-10-31 14:13:41.608	5	2025-10-31 14:14:49.37267	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Visita técnica pra verificar lentidão e reinstalar nos PCs impressoras da recepção. : R$ 100,00\n\n[{"name":"Visita técnica pra verificar lentidão e reinstalar nos PCs impressoras da recepção. ","description":"Visita técnica pra verificar lentidão e reinstalar nos PCs impressoras da recepção. ","type":"servico","unitPrice":100,"price":100,"amount":100,"quantity":1}]	320	100.00	0.00	[{"name":"Visita técnica pra verificar lentidão e reinstalar nos PCs impressoras da recepção. ","amount":100,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-10-31 14:14:49.37267	\N	0.00	1
241	Manutenção impressora Epson Loja 2. \n\nDiscriminação de valores:\n\nServiços:\n- Loja 2 - Impressora Epson. Desentupimento da cabeça de impressão e tubulação. Limpeza interna e lubrificação. Reset no sistema.: R$ 150,00\n\n[{"name":"Loja 2 - Impressora Epson. Desentupimento da cabeça de impressão e tubulação. Limpeza interna e lubrificação. Reset no sistema.","description":"Loja 2 - Impressora Epson. Desentupimento da cabeça de impressão e tubulação. Limpeza interna e lubrificação. Reset no sistema.","type":"servico","price":150,"amount":150,"quantity":1}]	93	\N	entrada	150.00	pago	\N	2025-08-21 19:06:16.323	2025-08-18 19:46:44.262	5	2025-08-21 19:06:17.058	9	\N	\N	\N	\N	\N	182	150.00	0.00	[{"name":"Loja 2 - Impressora Epson. Desentupimento da cabeça de impressão e tubulação. Limpeza interna e lubrificação. Reset no sistema.","amount":150,"type":"servico"}]	[]	\N	\N	2025-08-18 19:48:29.283416	\N	0.00	1
3	Manutenção preventiva na CPU com substituição da fonte de alimentação.\n\nDiscriminação de valores:\n\nServiços:\n- Manutenção preventiva e substituição da fonte de alimentação: R$ 100,00\n\nProdutos/Materiais:\n- Fonte ATX 12 V: R$ 120,00\n\n[{"name":"Fonte ATX 12 V","description":"Fonte ATX 12 V","type":"produto","price":120,"amount":120,"quantity":1},{"name":"Manutenção preventiva e substituição da fonte de alimentação","description":"Manutenção preventiva e substituição da fonte de alimentação","type":"servico","price":100,"amount":100,"quantity":1}]	54	\N	entrada	220.00	pendente	\N	\N	2025-07-07 03:00:00	1	2025-09-20 01:29:07.222	\N	\N	\N	\N	\N	CPU não está ligando	5	100.00	120.00	[{"name":"Manutenção preventiva e substituição da fonte de alimentação","amount":100,"type":"servico"}]	[{"name":"Fonte ATX 12 V","amount":120,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
386	Parcela 1 - Parcelamento avulso materiais e serviços 	21	\N	entrada	200.00	pago	\N	2025-09-20 01:38:24.825	2025-09-20 01:38:24.826	1	2025-09-20 01:38:24.84452	1	\N	377	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-20 01:38:24.84452	\N	0.00	1
389	Fonte para impressora de etiquetas	18	\N	entrada	90.00	pago	\N	2025-09-24 13:16:01.432	2025-09-24 02:11:00.723	1	2025-09-24 13:16:01.783	1	\N	\N	\N	\N	Fonte para impressora de etiquetas	256	90.00	0.00	[{"name":"Fonte para impressora de etiquetas","amount":90,"type":"servico"}]	[]	\N	\N	2025-09-24 02:11:23.639204	\N	0.00	1
187	Resolução de falha no sistema de Raio-X, com dois dias de trabalho dedicados à identificação e correção do problema. Foi realizado reparo no desktop do setor, onde, após extensa análise, foram detectadas falhas na placa-mãe e na fonte. As peças foram encaminhadas a parceiro especializado em reparo eletrônico.Após o conserto, foi necessário compreender e reconfigurar o funcionamento completo do sistema para restabelecer sua operação. Sistema restaurado, parametrizado e cópia de segurança criada para futuras eventualidades.	8	\N	entrada	1000.00	parcelado	\N	\N	2025-06-18 03:00:00	5	2025-08-03 12:57:41.552	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
189	Parcela 2/4 - Resolução de falha no sistema de Raio-X, com dois dias de trabalho dedicados à identificação e correção do problema. Foi realizado reparo no desktop do setor, onde, após extensa análise, foram detectadas falhas na placa-mãe e na fonte. As peças foram encaminhadas a parceiro especializado em reparo eletrônico.Após o conserto, foi necessário compreender e reconfigurar o funcionamento completo do sistema para restabelecer sua operação. Sistema restaurado, parametrizado e cópia de segurança criada para futuras eventualidades.	8	\N	entrada	250.00	pendente	2025-07-10 03:00:00	\N	2025-07-10 03:00:00	5	2025-08-03 12:45:54.271772	\N	\N	187	2	4	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
190	Parcela 3/4 - Resolução de falha no sistema de Raio-X, com dois dias de trabalho dedicados à identificação e correção do problema. Foi realizado reparo no desktop do setor, onde, após extensa análise, foram detectadas falhas na placa-mãe e na fonte. As peças foram encaminhadas a parceiro especializado em reparo eletrônico.Após o conserto, foi necessário compreender e reconfigurar o funcionamento completo do sistema para restabelecer sua operação. Sistema restaurado, parametrizado e cópia de segurança criada para futuras eventualidades.	8	\N	entrada	250.00	pendente	2025-08-10 03:00:00	\N	2025-08-10 03:00:00	5	2025-08-03 12:45:54.31894	\N	\N	187	3	4	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
191	Parcela 4/4 - Resolução de falha no sistema de Raio-X, com dois dias de trabalho dedicados à identificação e correção do problema. Foi realizado reparo no desktop do setor, onde, após extensa análise, foram detectadas falhas na placa-mãe e na fonte. As peças foram encaminhadas a parceiro especializado em reparo eletrônico.Após o conserto, foi necessário compreender e reconfigurar o funcionamento completo do sistema para restabelecer sua operação. Sistema restaurado, parametrizado e cópia de segurança criada para futuras eventualidades.	8	\N	entrada	250.00	pendente	2025-09-10 03:00:00	\N	2025-09-10 03:00:00	5	2025-08-03 12:45:54.368489	\N	\N	187	4	4	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
194	Parcela 2/4 - Elaboração de contrato comercial de prestação de serviços e desenvolvimento de inventário completo da clínica, com especificações detalhadas de todos os equipamentos.\n\nDiscriminação de valores:\n\nServiços:\n- Elaboração de contrato comercial de prestação d...: R$ 600,00\n\n[{"name":"Elaboração de contrato comercial de prestação d...","amount":600,"type":"servico"}]	8	\N	entrada	150.00	pendente	2025-07-10 03:00:00	\N	2025-07-10 03:00:00	5	2025-08-03 12:58:00.152851	\N	\N	192	2	4	\N	146	600.00	0.00	[{"name":"Elaboração de contrato comercial de prestação d...","amount":600,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
195	Parcela 3/4 - Elaboração de contrato comercial de prestação de serviços e desenvolvimento de inventário completo da clínica, com especificações detalhadas de todos os equipamentos.\n\nDiscriminação de valores:\n\nServiços:\n- Elaboração de contrato comercial de prestação d...: R$ 600,00\n\n[{"name":"Elaboração de contrato comercial de prestação d...","amount":600,"type":"servico"}]	8	\N	entrada	150.00	pendente	2025-08-10 03:00:00	\N	2025-08-10 03:00:00	5	2025-08-03 12:58:00.201841	\N	\N	192	3	4	\N	146	600.00	0.00	[{"name":"Elaboração de contrato comercial de prestação d...","amount":600,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
1277	Kalione final do lote Lenovo e nobreak	\N	\N	saida	750.00	pago	\N	2026-01-19 16:02:19.022	2026-01-19 16:02:11.713	1	2026-01-19 16:02:18.722	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-19 16:02:11.980909	\N	0.00	1
196	Parcela 4/4 - Elaboração de contrato comercial de prestação de serviços e desenvolvimento de inventário completo da clínica, com especificações detalhadas de todos os equipamentos.\n\nDiscriminação de valores:\n\nServiços:\n- Elaboração de contrato comercial de prestação d...: R$ 600,00\n\n[{"name":"Elaboração de contrato comercial de prestação d...","amount":600,"type":"servico"}]	8	\N	entrada	150.00	pendente	2025-09-10 03:00:00	\N	2025-09-10 03:00:00	5	2025-08-03 12:58:00.250633	\N	\N	192	4	4	\N	146	600.00	0.00	[{"name":"Elaboração de contrato comercial de prestação d...","amount":600,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
192	Elaboração de contrato comercial de prestação de serviços e desenvolvimento de inventário completo da clínica, com especificações detalhadas de todos os equipamentos.\n\nDiscriminação de valores:\n\nServiços:\n- Elaboração de contrato comercial de prestação d...: R$ 600,00\n\n[{"name":"Elaboração de contrato comercial de prestação d...","amount":600,"type":"servico"}]	8	\N	entrada	600.00	parcelado	\N	\N	2025-06-02 03:00:00	5	2025-08-03 12:58:24.363	\N	\N	\N	\N	\N	Elaboração de contrato comercial de prestação de serviços e desenvolvimento de inventário completo da clínica, com especificações detalhadas de todos os equipamentos.	146	600.00	0.00	[{"name":"Elaboração de contrato comercial de prestação d...","amount":600,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
198	Reparo no sistema operacional da máquina de ultrassom da Sala 3. O problema foi causado, possivelmente, por desligamentos incorretos decorrentes de falha recorrente na placa de vídeo, que ocasionalmente impede a exibição de vídeo, embora a máquina esteja operacional.\nEm tais situações, o colaborador vinha mantendo o botão power pressionado até o desligamento forçado, quando o correto seria pressionar e soltar o botão, permitindo o desligamento adequado.\nEsses desligamentos indevidos resultaram em falhas no sistema.	8	\N	entrada	500.00	pendente	\N	\N	2025-07-26 03:00:00	5	2025-08-03 13:30:13.591	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
427	Visita técnica para verificar câmeras após queda de energia. Identificado defeito na fonte do monitor; realizada troca da peça e restabelecido o funcionamento normal da visualização. Peça + serviço.	3	\N	entrada	120.00	pendente	\N	\N	2025-10-06 03:00:00	5	2025-10-06 12:43:24.025728	\N	\N	\N	\N	\N	\N	272	120.00	0.00	[{"name":"Visita técnica para verificar câmeras após queda de energia. Identificado defeito na fonte do monitor; realizada troca da peça e restabelecido o funcionamento normal da visualização. Peça + serviço.","amount":120,"type":"servico"}]	[]	\N	\N	2025-10-06 12:43:24.025728	\N	0.00	1
199	Visita técnica com urgência a tarde para verificar ultrassom sala 3. Não conseguia imprimir. Problema tomada de rede que ocasionou falha no servidor DICOM. 	8	\N	entrada	200.00	pendente	\N	\N	2025-07-10 03:00:00	5	2025-08-03 14:39:33.567	\N	\N	\N	\N	\N	Visita técnica cortesia para resolver alguns detalhes. Retorno Pc Rayane Wpp, colocamos coringa e o Pc trouxemos para analisar. Troca da impressora sala 3. Ajuste placa de vídeo rosado.	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
24	Passagem de cabos para todos os dispositivos utilizados na automatização do portão de eventos, incluindo sensores, leitor facial, botoeira e motor. Serviço + 100m de cabo de rede 100% cobre. \n\nDiscriminação de valores:\n\nServiços:\n- Passagem de cabos para todos os dispositivos utilizados na automatização do portão de eventos, incluindo sensores, leitor facial, botoeira e motor.: R$ 150,00\n\nProdutos/Materiais:\n- 100m Cabo Lan CAT5.E 100% Cobre: R$ 400,00\n\n[{"name":"100m Cabo Lan CAT5.E 100% Cobre","description":"100m Cabo Lan CAT5.E 100% Cobre","type":"produto","price":400,"amount":400,"quantity":1},{"name":"Passagem de cabos para todos os dispositivos utilizados na automatização do portão de eventos, incluindo sensores, leitor facial, botoeira e motor.","description":"Passagem de cabos para todos os dispositivos utilizados na automatização do portão de eventos, incluindo sensores, leitor facial, botoeira e motor.","type":"servico","price":150,"amount":150,"quantity":1}]	56	\N	entrada	550.00	pendente	\N	\N	2025-07-14 03:00:00	5	2025-08-03 14:48:44.209	\N	\N	\N	\N	\N	Roteador Portão de eventos.	38	150.00	400.00	[{"name":"Passagem de cabos para todos os dispositivos utilizados na automatização do portão de eventos, incluindo sensores, leitor facial, botoeira e motor.","amount":150,"type":"servico"}]	[{"name":"100m Cabo Lan CAT5.E 100% Cobre","amount":400,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
394	CPU com problemas na inicialização do sistema	77	\N	entrada	100.00	pago	\N	2025-09-24 20:47:32.327	2025-09-24 03:00:00	1	2025-09-24 20:47:32.538	1	\N	\N	\N	\N	Discriminação de valores:\n\nProdutos/Materiais:\n- Bateria CMOS CR2032 Intelbras garantia 1 ano: R$ 20,00\n- Visita técnica, diagnóstico e substituição da bateria e testes no equipamento: R$ 80,00\n\n[{"name":"Bateria CMOS CR2032 Intelbras garantia 1 ano","description":"Bateria CMOS CR2032 Intelbras garantia 1 ano","type":"produto","unitPrice":20,"price":20,"amount":20,"quantity":1},{"name":"Visita técnica, diagnóstico e substituição da bateria e testes no equipamento","description":"Visita técnica, diagnóstico e substituição da bateria e testes no equipamento","type":"produto","unitPrice":80,"price":80,"amount":80,"quantity":1}]	257	0.00	100.00	[]	[{"name":"Bateria CMOS CR2032 Intelbras garantia 1 ano","amount":20,"quantity":1,"type":"produto"},{"name":"Visita técnica, diagnóstico e substituição da bateria e testes no equipamento","amount":80,"quantity":1,"type":"produto"}]	\N	\N	2025-09-24 20:45:59.304779	\N	0.00	1
215	Reunião de 2 horas com Lierbet e Erick para análise conjunta da estrutura e das informações relacionadas à implantação de segurança na infraestrutura da Progel.	37	\N	entrada	200.00	pendente	\N	\N	2025-08-11 20:00:27.728	5	2025-08-11 20:01:14.927574	\N	\N	\N	\N	\N	\N	158	200.00	0.00	[{"name":"Reunião de 2 horas com Lierbet e Erick para análise conjunta da estrutura e das informações relacionadas à implantação de segurança na infraestrutura da Progel.","amount":200,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
206	Visita técnica para análise e solução de falha de conexão no Anexo (prédio novo). Identificado que os equipamentos de distribuição estavam desligados na antiga sala do ADM. Realizado o religamento dos dispositivos de rede, alarme e câmeras, restabelecendo a conectividade.	37	\N	entrada	150.00	pendente	\N	\N	2025-08-05 10:59:17.414	5	2025-08-05 10:59:49.967346	\N	\N	\N	\N	\N	\N	151	150.00	0.00	[{"name":"Visita técnica para análise e solução de falha de conexão no Anexo (prédio novo). Identificado que os equipamentos de distribuição estavam desligados na antiga sala do ADM. Realizado o religamento dos dispositivos de rede, alarme e câmeras, restabelecendo a conectividade.","amount":150,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
205	Instalação do Windows, programas e atualizações...\n\nDiscriminação de valores:\n\nServiços:\n- Instalação windows 10, programas, atualizações, suporte backup e reinstalação CH sistemas, instalação de impressora e demais ajustes necessários.: R$ 150,00\n\n[{"name":"Instalação windows 10, programas, atualizações, suporte backup e reinstalação CH sistemas, instalação de impressora e demais ajustes necessários.","description":"Instalação windows 10, programas, atualizações, suporte backup e reinstalação CH sistemas, instalação de impressora e demais ajustes necessários.","type":"servico","price":150,"amount":150,"quantity":1}]	80	\N	entrada	150.00	pago	\N	2025-08-05 13:38:25.722	2025-08-05 00:57:28.406	1	2025-08-05 13:38:26.532	1	\N	\N	\N	\N	Instalação do Windows, programas e atualizações...	150	150.00	0.00	[{"name":"Instalação windows 10, programas, atualizações, suporte backup e reinstalação CH sistemas, instalação de impressora e demais ajustes necessários.","amount":150,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
210	Manutenção preventiva e corretiva nas impressoras Brother da recepção e dos escritórios. Realizadas limpeza interna, lubrificação e substituição do cilindro.	56	\N	entrada	500.00	pendente	\N	\N	2025-08-03 03:00:00	5	2025-08-06 15:21:20.45123	\N	\N	\N	\N	\N	\N	155	500.00	0.00	[{"name":"Manutenção preventiva e corretiva nas impressoras Brother da recepção e dos escritórios. Realizadas limpeza interna, lubrificação e substituição do cilindro.","amount":500,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
211	Visita técnica para verificar ausência de conexão no portão de eventos. Identificado roteador com conectores de energia e LAN oxidados, possivelmente devido à exposição à água durante chuvas, em função de telhado aberto. Realizada desoxidação dos conectores e ajustes nas telhas para proteger o equipamento.	56	\N	entrada	150.00	pendente	\N	\N	2025-08-07 15:11:56.892	5	2025-08-07 15:12:16.361244	\N	\N	\N	\N	\N	\N	156	150.00	0.00	[{"name":"Visita técnica para verificar ausência de conexão no portão de eventos. Identificado roteador com conectores de energia e LAN oxidados, possivelmente devido à exposição à água durante chuvas, em função de telhado aberto. Realizada desoxidação dos conectores e ajustes nas telhas para proteger o equipamento.","amount":150,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
291	Ajustes na Sala da Diretoria: instalação de impressora na rede e mapeamento no notebook da diretora; configuração de espelhamento de tela na TV com atualização de sistema e liberação de serviço no antivírus. No notebook da recepção, realizada configuração para acesso às câmeras.	23	\N	entrada	150.00	pago	\N	2025-09-18 19:21:22.074	2025-09-09 19:37:06.447	5	2025-09-18 19:21:22.988	9	\N	\N	\N	\N	\N	231	150.00	0.00	[{"name":"Ajustes na Sala da Diretoria: instalação de impressora na rede e mapeamento no notebook da diretora; configuração de espelhamento de tela na TV com atualização de sistema e liberação de serviço no antivírus. No notebook da recepção, realizada configuração para acesso às câmeras.","amount":150,"type":"servico"}]	[]	\N	\N	2025-09-09 19:37:22.612974	\N	0.00	1
421	Instalar impressora no quinta doa lagos. 	19	\N	entrada	150.00	pago	\N	2025-09-30 20:08:22.995	2025-09-30 14:32:10.14	5	2025-09-30 20:08:22.608	9	\N	\N	\N	\N	\N	268	150.00	0.00	[{"name":"Instalar impressora no quinta doa lagos. ","amount":150,"type":"servico"}]	[]	\N	\N	2025-09-30 14:33:19.651561	\N	0.00	1
219	Última nota do sistema antigo. Dellzão, monitor e roteador.	34	\N	entrada	1600.00	pago	\N	2025-08-14 00:22:08.476	2025-08-13 03:00:00	1	2025-08-14 00:22:08.398	1	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
222	SSD 512 rancho da serra\n\nDiscriminação de valores:\n\nServiços:\n- Instalação SSD NVME 512GB, Backup SSD antigo, Instalação, atualização e configuração do sistema operacional e programas no SSD novo. Limpeza interna.: R$ 150,00\n\nProdutos/Materiais:\n- SSD NVME KNUP 512GB (1 ano garantia ): R$ 420,00\n\n[{"name":"Instalação SSD NVME 512GB, Backup SSD antigo, Instalação, atualização e configuração do sistema operacional e programas no SSD novo. Limpeza interna.","description":"Instalação SSD NVME 512GB, Backup SSD antigo, Instalação, atualização e configuração do sistema operacional e programas no SSD novo. Limpeza interna.","type":"servico","price":150,"amount":150,"quantity":1},{"name":"SSD NVME KNUP 512GB (1 ano garantia )","description":"SSD NVME KNUP 512GB (1 ano garantia )","type":"produto","price":420,"amount":420,"quantity":1}]	20	\N	entrada	570.00	pago	\N	2025-08-21 19:08:11.484	2025-08-13 18:31:01.375	5	2025-08-21 19:08:12.822	9	\N	\N	\N	\N	SSD 512 rancho da serra	164	150.00	420.00	[{"name":"Instalação SSD NVME 512GB, Backup SSD antigo, Instalação, atualização e configuração do sistema operacional e programas no SSD novo. Limpeza interna.","amount":150,"type":"servico"}]	[{"name":"SSD NVME KNUP 512GB (1 ano garantia )","amount":420,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
492	Valor referente a notas passadas. 	127	317	entrada	350.00	pendente	\N	\N	2025-04-07 03:00:00	5	2025-10-31 15:41:43.972091	\N	\N	\N	\N	\N	\N	321	350.00	0.00	[{"name":"Valor referente a notas passadas. ","amount":350,"type":"servico"}]	[]	\N	\N	2025-10-31 15:41:43.972091	\N	0.00	1
223	Visita técnica para análise e solução de lentidão na conexão cabeada do notebook da Monique. Realizada a substituição do conector RJ45 do cabo de rede.	37	\N	entrada	100.00	pendente	\N	\N	2025-08-12 03:00:00	5	2025-08-13 20:39:05.742243	\N	\N	\N	\N	\N	\N	159	100.00	0.00	[{"name":"Visita técnica para análise e solução de lentidão na conexão cabeada do notebook da Monique. Realizada a substituição do conector RJ45 do cabo de rede.","amount":100,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
225	Suporte técnico para identificar e resolver problemas nos emails após alteração da empresa que edita o site que é hospedado no mesmo domínio dos emails. Apontamentos DNS tinham sido alterados, causando erros e detectando emails como spam.	56	\N	entrada	100.00	pendente	\N	\N	2025-08-07 03:00:00	5	2025-08-13 20:47:07.396011	\N	\N	\N	\N	\N	\N	162	100.00	0.00	[{"name":"Suporte técnico para identificar e resolver problemas nos emails após alteração da empresa que edita o site que é hospedado no mesmo domínio dos emails. Apontamentos DNS tinham sido alterados, causando erros e detectando emails como spam.","amount":100,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
218	Parcela 2/2 - Reposição de tela, teclado e DC Jack notebook Samsung\n\nDiscriminação de valores:\n\nServiços:\n- Mão de obra especializada para substituição de tela e testes nos componentes: R$ 150,00\n- Reposição DC Jack solda na placa: R$ 50,00\n\nProdutos/Materiais:\n- Tela 15,6" nova com garantia: R$ 350,00\n- Teclado notebook Samsung: R$ 120,00\n- CD Jack Samsung: R$ 30,00\n\n[{"name":"Mão de obra especializada para substituição de tela e testes nos componentes","amount":150,"type":"servico"},{"name":"Tela 15,6\\" nova com garantia","amount":350,"type":"produto"},{"name":"Teclado notebook Samsung","amount":120,"type":"produto"},{"name":"CD Jack Samsung","description":"CD Jack Samsung","type":"produto","price":30,"amount":30,"quantity":1},{"name":"Reposição DC Jack solda na placa","description":"Reposição DC Jack solda na placa","type":"servico","price":50,"amount":50,"quantity":1}]	78	\N	entrada	200.00	pago	2025-09-13 03:00:00	2025-09-08 13:53:40.673	2025-09-13 03:00:00	1	2025-09-08 13:53:40.876	1	\N	216	2	2	\N	65	200.00	500.00	[{"name":"Mão de obra especializada para substituição de tela e testes nos componentes","amount":150,"type":"servico"},{"name":"Reposição DC Jack solda na placa","amount":50,"type":"servico"}]	[{"name":"Tela 15,6\\" nova com garantia","amount":350,"type":"produto"},{"name":"Teclado notebook Samsung","amount":120,"type":"produto"},{"name":"CD Jack Samsung","amount":30,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
398	Google drive Mastercar	\N	\N	saida	85.00	pago	\N	2025-09-25 01:25:23.051	2025-09-25 01:25:23.051	1	2025-09-25 01:25:23.592358	1	2025-09-25 01:25:23.051	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-25 01:25:23.592358	\N	0.00	1
405	Notebook pra trocar bateria da CMOS.	111	\N	entrada	100.00	pendente	\N	\N	2025-09-24 20:38:05.501	5	2025-09-25 13:36:52.230539	\N	\N	\N	\N	\N	\N	260	100.00	0.00	[{"name":"Notebook pra trocar bateria da CMOS.","amount":100,"type":"servico"}]	[]	\N	\N	2025-09-25 13:36:52.230539	\N	0.00	1
406	Estabilizador para o setor para computador, Ana Paula.	56	\N	entrada	100.00	pendente	\N	\N	2025-09-25 03:00:00	5	2025-09-25 13:45:04.052204	\N	\N	\N	\N	\N	\N	261	100.00	0.00	[{"name":"Estabilizador para o setor para computador, Ana Paula.","amount":100,"type":"servico"}]	[]	\N	\N	2025-09-25 13:45:04.052204	\N	0.00	1
301	Visita técnica para resolver problema em nobreak que não estava ligando. Identificado fim de vida da bateria, realizada a troca. Bateria 12V/7A + Serviço.	3	\N	entrada	220.00	pendente	\N	\N	2025-09-10 04:31:29.907	5	2025-09-10 04:31:54.394812	\N	\N	\N	\N	\N	\N	233	220.00	0.00	[{"name":"Visita técnica para resolver problema em nobreak que não estava ligando. Identificado fim de vida da bateria, realizada a troca. Bateria 12V/7A + Serviço.","amount":220,"type":"servico"}]	[]	\N	\N	2025-09-10 04:31:54.394812	\N	0.00	1
407	Notebook não inicia sistema e não segura configuracao da CMOS. 	107	\N	entrada	380.00	pendente	\N	\N	2025-09-18 19:31:26.27	5	2025-09-25 13:45:23.115049	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Serviço de diagnóstica e resolução. Defeito no SSD, troca do SSD e reinstalação do sistema e programas. Troca da bateria CMOS.: R$ 150,00\n\nProdutos/Materiais:\n- SSD SATA KingSpec 240gb (1 ano Garantia): R$ 210,00\n- Bateria Intelbras 2032 CMOS: R$ 20,00\n\n[{"name":"Serviço de diagnóstica e resolução. Defeito no SSD, troca do SSD e reinstalação do sistema e programas. Troca da bateria CMOS.","description":"Serviço de diagnóstica e resolução. Defeito no SSD, troca do SSD e reinstalação do sistema e programas. Troca da bateria CMOS.","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1},{"name":"SSD SATA KingSpec 240gb (1 ano Garantia)","description":"SSD SATA KingSpec 240gb (1 ano Garantia)","type":"produto","unitPrice":210,"price":210,"amount":210,"quantity":1},{"name":"Bateria Intelbras 2032 CMOS","description":"Bateria Intelbras 2032 CMOS","type":"produto","unitPrice":20,"price":20,"amount":20,"quantity":1}]	246	150.00	230.00	[{"name":"Serviço de diagnóstica e resolução. Defeito no SSD, troca do SSD e reinstalação do sistema e programas. Troca da bateria CMOS.","amount":150,"quantity":1,"type":"servico"}]	[{"name":"SSD SATA KingSpec 240gb (1 ano Garantia)","amount":210,"quantity":1,"type":"produto"},{"name":"Bateria Intelbras 2032 CMOS","amount":20,"quantity":1,"type":"produto"}]	\N	\N	2025-09-25 13:45:23.115049	\N	0.00	1
226	Serviço do servidor. Troca do SSD e cópia dos arquivos e sistemas, deixando pronto pra uso. Limpeza interna, desoxidação das placas e troca de pasta térmica.\n\nDiscriminação de valores:\n\nServiços:\n- Serviço do servidor. Troca do SSD e cópia dos arquivos e sistemas, deixando pronto pra uso. Limpeza interna, desoxidação das placas e troca de pasta térmica.: R$ 250,00\n\n[{"name":"Serviço do servidor. Troca do SSD e cópia dos arquivos e sistemas, deixando pronto pra uso. Limpeza interna, desoxidação das placas e troca de pasta térmica.","description":"Serviço do servidor. Troca do SSD e cópia dos arquivos e sistemas, deixando pronto pra uso. Limpeza interna, desoxidação das placas e troca de pasta térmica.","type":"servico","price":250,"amount":250,"quantity":1}]	55	\N	entrada	250.00	pendente	\N	\N	2025-06-19 03:00:00	5	2025-08-13 20:59:26.536	\N	\N	\N	\N	\N		166	250.00	0.00	[{"name":"Serviço do servidor. Troca do SSD e cópia dos arquivos e sistemas, deixando pronto pra uso. Limpeza interna, desoxidação das placas e troca de pasta térmica.","amount":250,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
227	Mão de obra especializada. Limpeza interna, desoxidação das placas e troca da pasta térmica. Substituição da fonte de alimentação e montagem do kit em gabinete novo. Serviço + Fonte + Gabinete.\n\nDiscriminação de valores:\n\nServiços:\n- Mão de obra especializada. Limpeza interna, desoxidação das placas e troca da pasta térmica. Substituição da fonte de alimentação e montagem do kit em gabinete novo.: R$ 150,00\n\nProdutos/Materiais:\n- Fonte ATX 24 Pinos: R$ 120,00\n- Gabinete/Carcaça CPU preta. : R$ 50,00\n\n[{"name":"Mão de obra especializada. Limpeza interna, desoxidação das placas e troca da pasta térmica. Substituição da fonte de alimentação e montagem do kit em gabinete novo.","amount":150,"type":"servico"},{"name":"Fonte ATX 24 Pinos","amount":120,"type":"produto"},{"name":"Gabinete/Carcaça CPU preta. ","amount":50,"type":"produto"}]	55	\N	entrada	320.00	pendente	\N	\N	2025-07-21 03:00:00	5	2025-08-13 21:00:42.136568	\N	\N	\N	\N	\N	Pc na assistência não liga.	165	150.00	170.00	[{"name":"Mão de obra especializada. Limpeza interna, desoxidação das placas e troca da pasta térmica. Substituição da fonte de alimentação e montagem do kit em gabinete novo.","amount":150,"type":"servico"}]	[{"name":"Fonte ATX 24 Pinos","amount":120,"type":"produto"},{"name":"Gabinete/Carcaça CPU preta. ","amount":50,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
217	Parcela 1/2 - Reposição de tela, teclado e DC Jack notebook Samsung\n\nDiscriminação de valores:\n\nServiços:\n- Mão de obra especializada para substituição de tela e testes nos componentes: R$ 150,00\n- Reposição DC Jack solda na placa: R$ 50,00\n\nProdutos/Materiais:\n- Tela 15,6" nova com garantia: R$ 350,00\n- Teclado notebook Samsung: R$ 120,00\n- CD Jack Samsung: R$ 30,00\n\n[{"name":"Mão de obra especializada para substituição de tela e testes nos componentes","amount":150,"type":"servico"},{"name":"Tela 15,6\\" nova com garantia","amount":350,"type":"produto"},{"name":"Teclado notebook Samsung","amount":120,"type":"produto"},{"name":"CD Jack Samsung","description":"CD Jack Samsung","type":"produto","price":30,"amount":30,"quantity":1},{"name":"Reposição DC Jack solda na placa","description":"Reposição DC Jack solda na placa","type":"servico","price":50,"amount":50,"quantity":1}]	78	\N	entrada	500.00	pago	2025-08-13 03:00:00	2025-08-14 00:40:11.514	2025-08-13 03:00:00	1	2025-08-14 00:40:14.177	1	\N	216	1	2	\N	65	200.00	500.00	[{"name":"Mão de obra especializada para substituição de tela e testes nos componentes","amount":150,"type":"servico"},{"name":"Reposição DC Jack solda na placa","amount":50,"type":"servico"}]	[{"name":"Tela 15,6\\" nova com garantia","amount":350,"type":"produto"},{"name":"Teclado notebook Samsung","amount":120,"type":"produto"},{"name":"CD Jack Samsung","amount":30,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
44	Diversos acessos remotos realizados para configuração de impressora e scanner de rede. Foram identificados erros no sistema operacional (Windows 11), que exigiram ajustes específicos para concluir os compartilhamentos e instalações. O servidor foi atualizado para Windows 11 Pro, substituindo a versão Home Single, que possui limitações que impediam o compartilhamento adequado dos dispositivos. Impressora instalada e mapeada em duas máquinas; scanner de rede configurado em uma máquina. Além disso, realizada a configuração do Outlook do colaborador Fábio.	37	\N	entrada	150.00	pendente	\N	\N	2025-07-24 03:00:00	5	2025-08-15 13:53:42.397	\N	\N	\N	\N	\N	Porgel Bahia.	59	150.00	0.00	[{"name":"Diversos acessos remotos realizados para configuração de impressora e scanner de rede. Foram identificados erros no sistema operacional (Windows 11), que exigiram ajustes específicos para concluir os compartilhamentos e instalações. O servidor foi atualizado para Windows 11 Pro, substituindo a versão Home Single, que possui limitações que impediam o compartilhamento adequado dos dispositivos. Impressora instalada e mapeada em duas máquinas; scanner de rede configurado em uma máquina. Além disso, realizada a configuração do Outlook do colaborador Fábio.","amount":150,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
235	Reposição bateria de nobreak e diagnóstico na tomada de energia com problemas\n\nDiscriminação de valores:\n\nServiços:\n- Visita técnica com manutenção de nobreak e ajustes na estrutura: R$ 100,00\n\nProdutos/Materiais:\n- Bateria 12v 7ah Intelbras: R$ 140,00\n\n[{"name":"Visita técnica com manutenção de nobreak e ajustes na estrutura","amount":100,"type":"servico"},{"name":"Bateria 12v 7ah Intelbras","amount":140,"type":"produto"}]	37	\N	entrada	240.00	pendente	\N	\N	2025-07-28 03:00:00	1	2025-08-15 14:03:48.169228	\N	\N	\N	\N	\N	Reposição bateria de nobreak e diagnóstico na tomada de energia com problemas	24	100.00	140.00	[{"name":"Visita técnica com manutenção de nobreak e ajustes na estrutura","amount":100,"type":"servico"}]	[{"name":"Bateria 12v 7ah Intelbras","amount":140,"type":"produto"}]	\N	\N	2025-08-15 14:03:48.169228	\N	0.00	1
396	Pagamento que estava pendente há algum tempo	112	\N	entrada	130.00	pago	\N	2025-09-25 01:18:48.006	2025-09-25 01:17:56.018	1	2025-09-25 01:18:48.133	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-25 01:17:56.18715	\N	0.00	1
399	Monitores Kalione 	\N	\N	saida	500.00	pago	\N	2025-09-25 01:26:01.218	2025-09-25 01:26:01.218	1	2025-09-25 01:26:01.381643	1	2025-09-25 01:26:01.218	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-25 01:26:01.381643	\N	0.00	1
408	Visita técnica para verificar problema de impressão na Sala Supervisão. Erro de rede no computador. Resolvido e impressões normalizadas.	42	\N	entrada	100.00	pendente	\N	\N	2025-09-23 13:25:42.78	5	2025-09-25 13:45:36.588321	\N	\N	\N	\N	\N	\N	253	100.00	0.00	[{"name":"Visita técnica para verificar problema de impressão na Sala Supervisão. Erro de rede no computador. Resolvido e impressões normalizadas.","amount":100,"type":"servico"}]	[]	\N	\N	2025-09-25 13:45:36.588321	\N	0.00	1
462	Conectores de vídeo balun	\N	\N	saida	60.00	pago	\N	2025-10-16 18:09:37.593	2025-10-16 18:09:37.593	1	2025-10-16 18:09:37.745679	1	2025-10-16 18:09:37.593	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-16 18:09:37.745679	\N	0.00	1
463	Salão Jovem	\N	\N	saida	200.00	pago	\N	2025-10-16 22:36:29.021	2025-10-16 22:36:29.021	1	2025-10-16 22:36:29.191986	1	2025-10-16 22:36:29.021	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-16 22:36:29.191986	\N	0.00	1
464	Parcela 3/5 - Manutenção preventiva de todas as máquinas das 3 lojas.	28	\N	entrada	320.00	pendente	\N	\N	2025-09-10 03:00:00	5	2025-10-17 13:42:38.041	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-10-17 13:39:40.126922	\N	0.00	1
467	Almoço amigas pós afim 	\N	\N	saida	50.00	pago	\N	2025-10-17 17:18:09.583	2025-10-17 17:18:09.583	1	2025-10-17 17:18:09.733535	1	2025-10-17 17:18:09.583	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-17 17:18:09.733535	\N	0.00	1
493	Desktop - Limpeza interna, desoxidação nas placas e troca da pasta térmica. Ajustes no sistema operacional. 	127	318	entrada	180.00	pendente	\N	\N	2025-05-05 03:00:00	5	2025-10-31 15:41:56.961182	\N	\N	\N	\N	\N	\N	322	180.00	0.00	[{"name":"Desktop - Limpeza interna, desoxidação nas placas e troca da pasta térmica. Ajustes no sistema operacional. ","amount":180,"type":"servico"}]	[]	\N	\N	2025-10-31 15:41:56.961182	\N	0.00	1
247	Melhoria Memória RAM PC Recepção\n\nDiscriminação de valores:\n\nProdutos/Materiais:\n- Memória RAM DDR3 8GB 1333: R$ 210,00\n\n[{"type":"produto","description":"Memória RAM DDR3 8GB 1333","amount":"210"}]	59	\N	entrada	210.00	pendente	\N	\N	2025-08-19 14:45:47.874	1	2025-08-20 12:48:12.492608	\N	\N	\N	\N	\N	Upgrade de memória. Acrescentar +8gb de memória para somar com os 4gb que já tem e totalizando 12gb. Dessa forma ficando com folga suficiente para máquina trabalhar com bom desenho. 	184	0.00	210.00	[]	[{"name":"Memória RAM DDR3 8GB 1333","amount":210,"type":"produto"}]	\N	\N	2025-08-20 12:48:12.492608	\N	0.00	1
249	Visita técnica para verificar problema na impressora de rótulo da recepção João da Escóssia. Falha na conexão, reinstalação da impressora. 	28	\N	entrada	100.00	pendente	\N	\N	2025-08-15 11:12:55.738	5	2025-08-20 13:06:08.955704	\N	\N	\N	\N	\N	\N	177	100.00	0.00	[{"name":"Visita técnica para verificar problema na impressora de rótulo da recepção João da Escóssia. Falha na conexão, reinstalação da impressora. ","amount":100,"type":"servico"}]	[]	\N	\N	2025-08-20 13:06:08.955704	\N	0.00	1
253	Estabilizador 1000 va barulho e oscilação de energia\n\nDiscriminação de valores:\n\nServiços:\n- Reparo na placa do estabilizador com reposição de componentes: R$ 150,00\n\n[{"name":"Reparo na placa do estabilizador com reposição de componentes","description":"Reparo na placa do estabilizador com reposição de componentes","type":"servico","price":150,"amount":150,"quantity":1}]	64	\N	entrada	150.00	pendente	\N	\N	2025-07-28 03:00:00	1	2025-08-21 00:20:14.763745	\N	\N	\N	\N	\N	Estabilizador 1000 va	113	150.00	0.00	[{"name":"Reparo na placa do estabilizador com reposição de componentes","amount":150,"type":"servico"}]	[]	\N	\N	2025-08-21 00:20:14.763745	\N	0.00	1
256	Serviço -\n\nDiscriminação de valores:\n\nServiços:\n- Serviço - : R$ 100,00\n\n[{"name":"Serviço - ","amount":100,"type":"servico"}]	15	\N	entrada	100.00	pendente	\N	\N	2025-07-28 13:20:07.653	1	2025-08-21 00:27:03.649596	\N	\N	\N	\N	\N	Serviço -	23	100.00	0.00	[{"name":"Serviço - ","amount":100,"type":"servico"}]	[]	\N	\N	2025-08-21 00:27:03.649596	\N	0.00	1
1167	Manutenção Projetores Multimídia.	87	312	entrada	1500.00	pendente	\N	\N	2025-11-27 03:46:42.326	1	2025-11-29 10:49:39.004	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- 4x Efetuado a troca da placa mãe para resolver problema intermitente. Manutenção preventiva e corretiva dos projetores multimídia da escola, incluindo limpeza interna, desoxidação de placas, troca de pasta térmica, troca da bateria CMOS, reinstalação do sistema operacional e correção de falhas, deixando os equipamentos operacionais e prontos para uso. (R$ 250,00 cada): R$ 1000,00\n- Efetuada a troca da placa-mãe para solução do problema intermitente. Realizada manutenção preventiva e corretiva dos projetores multimídia, incluindo limpeza interna, desoxidação das placas, troca da pasta térmica, reinstalação do sistema operacional e correções gerais, deixando todos os equipamentos operacionais e prontos para uso.: R$ 500,00\n\n[{"name":"Efetuado a troca da placa mãe para resolver problema intermitente. Manutenção preventiva e corretiva dos projetores multimídia da escola, incluindo limpeza interna, desoxidação de placas, troca de pasta térmica, troca da bateria CMOS, reinstalação do sistema operacional e correção de falhas, deixando os equipamentos operacionais e prontos para uso.","description":"Efetuado a troca da placa mãe para resolver problema intermitente. Manutenção preventiva e corretiva dos projetores multimídia da escola, incluindo limpeza interna, desoxidação de placas, troca de pasta térmica, troca da bateria CMOS, reinstalação do sistema operacional e correção de falhas, deixando os equipamentos operacionais e prontos para uso.","type":"servico","unitPrice":250,"price":1000,"amount":1000,"quantity":4},{"name":"Efetuada a troca da placa-mãe para solução do problema intermitente. Realizada manutenção preventiva e corretiva dos projetores multimídia, incluindo limpeza interna, desoxidação das placas, troca da pasta térmica, reinstalação do sistema operacional e correções gerais, deixando todos os equipamentos operacionais e prontos para uso.","description":"Efetuada a troca da placa-mãe para solução do problema intermitente. Realizada manutenção preventiva e corretiva dos projetores multimídia, incluindo limpeza interna, desoxidação das placas, troca da pasta térmica, reinstalação do sistema operacional e correções gerais, deixando todos os equipamentos operacionais e prontos para uso.","type":"servico","unitPrice":500,"price":500,"amount":500,"quantity":1}]	316	1500.00	0.00	[{"name":"Efetuado a troca da placa mãe para resolver problema intermitente. Manutenção preventiva e corretiva dos projetores multimídia da escola, incluindo limpeza interna, desoxidação de placas, troca de pasta térmica, troca da bateria CMOS, reinstalação do sistema operacional e correção de falhas, deixando os equipamentos operacionais e prontos para uso.","amount":1000,"quantity":4,"type":"servico"},{"name":"Efetuada a troca da placa-mãe para solução do problema intermitente. Realizada manutenção preventiva e corretiva dos projetores multimídia, incluindo limpeza interna, desoxidação das placas, troca da pasta térmica, reinstalação do sistema operacional e correções gerais, deixando todos os equipamentos operacionais e prontos para uso.","amount":500,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-11-27 03:46:42.348383	\N	0.00	9
246	Backup, instalação Windows 10 e programas\n\nDiscriminação de valores:\n\nServiços:\n- Backup, instalação Windows 10 pro e ajustes: R$ 150,00\n\n[{"name":"Backup, instalação Windows 10 pro e ajustes","description":"Backup, instalação Windows 10 pro e ajustes","type":"servico","price":150,"amount":150,"quantity":1}]	92	\N	entrada	150.00	pago	\N	2025-08-28 18:44:52.634	2025-08-15 21:38:11.706	1	2025-08-28 18:44:54.228	1	\N	\N	\N	\N	\N	178	150.00	0.00	[{"name":"Backup, instalação Windows 10 pro e ajustes","amount":150,"type":"servico"}]	[]	\N	\N	2025-08-20 12:47:38.282644	\N	0.00	1
397	Valor que estava pendente e foi acertado	113	\N	entrada	100.00	pago	\N	2025-09-25 01:20:25.023	2025-09-25 01:20:11.59	1	2025-09-25 01:20:25.298	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-25 01:20:11.765127	\N	0.00	1
400	Mensalidade sistema assistência	\N	\N	saida	170.00	pago	\N	2025-09-25 01:26:28.192	2025-09-25 01:26:28.192	1	2025-09-25 01:26:28.360401	1	2025-09-25 01:26:28.192	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-25 01:26:28.360401	\N	0.00	1
409	Mudança Juana. 	56	\N	entrada	150.00	pendente	\N	\N	2025-09-22 20:07:05.734	5	2025-09-25 13:45:51.759658	\N	\N	\N	\N	\N	\N	251	150.00	0.00	[{"name":"Mudança Juana. ","amount":150,"type":"servico"}]	[]	\N	\N	2025-09-25 13:45:51.759658	\N	0.00	1
244	Manutenção de computadores, impressora e rede.\n\nDiscriminação de valores:\n\nServiços:\n- Backup, instalação Windows 10 pro com pacote de programas e atualizações computador balcão: R$ 150,00\n- Backup, instalação Windows 10 pro com pacote de programas e atualizações computador que veio de Natal: R$ 150,00\n- Manutenção impressora Epson com reparo na cabeça de impressão: R$ 150,00\n- Ajustes na configuração da rede e da impressora da recepção e compartilhamento da impressora para todas as máquinas.: R$ 100,00\n\n[{"name":"Backup, instalação Windows 10 pro com pacote de programas e atualizações computador balcão","description":"Backup, instalação Windows 10 pro com pacote de programas e atualizações computador balcão","type":"servico","price":150,"amount":150,"quantity":1},{"name":"Backup, instalação Windows 10 pro com pacote de programas e atualizações computador que veio de Natal","description":"Backup, instalação Windows 10 pro com pacote de programas e atualizações computador que veio de Natal","type":"servico","price":150,"amount":150,"quantity":1},{"name":"Manutenção impressora Epson com reparo na cabeça de impressão","description":"Manutenção impressora Epson com reparo na cabeça de impressão","type":"servico","price":150,"amount":150,"quantity":1},{"name":"Ajustes na configuração da rede e da impressora da recepção e compartilhamento da impressora para todas as máquinas.","description":"Ajustes na configuração da rede e da impressora da recepção e compartilhamento da impressora para todas as máquinas.","type":"servico","price":100,"amount":100,"quantity":1}]	22	\N	entrada	550.00	pago	\N	2025-10-09 13:44:20.592	2025-08-20 03:00:00	1	2025-10-09 13:44:20.721	1	\N	\N	\N	\N	Duas formatações, reparo na cabeça de impressão da impressora Epson e ajustes na rede no setor do caixa/balcão.	188	550.00	0.00	[{"name":"Backup, instalação Windows 10 pro com pacote de programas e atualizações computador balcão","amount":150,"type":"servico"},{"name":"Backup, instalação Windows 10 pro com pacote de programas e atualizações computador que veio de Natal","amount":150,"type":"servico"},{"name":"Manutenção impressora Epson com reparo na cabeça de impressão","amount":150,"type":"servico"},{"name":"Ajustes na configuração da rede e da impressora da recepção e compartilhamento da impressora para todas as máquinas.","amount":100,"type":"servico"}]	[]	\N	\N	2025-08-20 12:40:21.542699	\N	0.00	1
465	Parcela 3/5 - Desktop completo para recepção João da Escóssia.	28	\N	entrada	200.00	pendente	\N	\N	2025-09-10 03:00:00	5	2025-10-17 13:42:25.469	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-10-17 13:40:28.922477	\N	0.00	1
468	Impressora recepção com atolamento de papel	83	287	entrada	100.00	pendente	\N	\N	2025-10-20 03:00:00	1	2025-10-21 17:32:08.901	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Visita técnica para ajustes nas impressoras da recepção e consultório dra Mariana: R$ 100,00\n\n[{"name":"Visita técnica para ajustes nas impressoras da recepção e consultório dra Mariana","description":"Visita técnica para ajustes nas impressoras da recepção e consultório dra Mariana","type":"servico","unitPrice":100,"price":100,"amount":100,"quantity":1}]	297	100.00	0.00	[{"name":"Visita técnica para ajustes nas impressoras da recepção e consultório dra Mariana","amount":100,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-10-21 17:29:31.888053	\N	0.00	1
481	Pegar máquina no escritório e levar para instalar na casa dele. 	64	299	entrada	230.00	pendente	\N	\N	2025-10-24 13:00:05.738	5	2025-10-24 13:07:42.733785	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Logística transporte material escritório para casa de Francisco..montagem e configuração da máquina. Instalação wi-fi/USB. : R$ 150,00\n\nProdutos/Materiais:\n- Placa wi-fi/USB: R$ 80,00\n\n[{"name":"Logística transporte material escritório para casa de Francisco..montagem e configuração da máquina. Instalação wi-fi/USB. ","description":"Logística transporte material escritório para casa de Francisco..montagem e configuração da máquina. Instalação wi-fi/USB. ","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1},{"name":"Placa wi-fi/USB","description":"Placa wi-fi/USB","type":"produto","unitPrice":80,"price":80,"amount":80,"quantity":1}]	309	150.00	80.00	[{"name":"Logística transporte material escritório para casa de Francisco..montagem e configuração da máquina. Instalação wi-fi/USB. ","amount":150,"quantity":1,"type":"servico"}]	[{"name":"Placa wi-fi/USB","amount":80,"quantity":1,"type":"produto"}]	\N	\N	2025-10-24 13:07:42.733785	\N	0.00	1
254	Melhorias estrutura de rede e CFTV. \n\nDiscriminação de valores:\n\nServiços:\n- Valor referente a combustível para locomoção Mossoró/Tibau e Tibau/Mossoró.: R$ 50,00\n- Valor referente alimentação/Jantar para dois técnicos do dia 25/07/25. : R$ 69,00\n- Infraestrutura de rede e Wi-Fi: instalada nova antena para cobertura do setor da piscina. Realizado o reposicionamento das antenas do restaurante, ampliando a qualidade do sinal. Toda a estrutura do restaurante e áreas próximas passou a ser alimentada diretamente pelo rack principal da recepção, reduzindo cascateamento e emendas no trajeto. Ajustado também o Wi-Fi destinado aos funcionários, que estava inoperante.: R$ 400,00\n- Ajustes no sistema de CFTV: reposicionamento da câmera do corredor da cozinha para a área de leitura. No restaurante, realizado repasse do cabo, substituição dos conectores e instalação de nova câmera. Efetuados ajustes de posicionamento para melhorar os ângulos de captura e refeitos conectores de algumas câmeras, eliminando oxidação e aprimorando o sinal.: R$ 300,00\n\nProdutos/Materiais:\n- 200m de cabo rede CAT5.E 100% Cobre. ( Alimentação das antenas e câmera do restaurante direto para rack da recepção): R$ 800,00\n- Câmera Bullet Intelbras HD ( P/ Restaurante): R$ 160,00\n- 3 Pares de conectores Ballun. Alimentação de vídeos de 3 cameras. : R$ 60,00\n- 3 conectores P4 alimentação de energia de 3 cameras. : R$ 20,00\n\n[{"name":"Valor referente a combustível para locomoção Mossoró/Tibau e Tibau/Mossoró.","description":"Valor referente a combustível para locomoção Mossoró/Tibau e Tibau/Mossoró.","type":"servico","price":50,"amount":50,"quantity":1},{"name":"Valor referente alimentação/Jantar para dois técnicos do dia 25/07/25. ","description":"Valor referente alimentação/Jantar para dois técnicos do dia 25/07/25. ","type":"servico","price":69,"amount":69,"quantity":1},{"name":"200m de cabo rede CAT5.E 100% Cobre. ( Alimentação das antenas e câmera do restaurante direto para rack da recepção)","description":"200m de cabo rede CAT5.E 100% Cobre. ( Alimentação das antenas e câmera do restaurante direto para rack da recepção)","type":"produto","price":800,"amount":800,"quantity":1},{"name":"Câmera Bullet Intelbras HD ( P/ Restaurante)","description":"Câmera Bullet Intelbras HD ( P/ Restaurante)","type":"produto","price":160,"amount":160,"quantity":1},{"name":"3 Pares de conectores Ballun. Alimentação de vídeos de 3 cameras. ","description":"3 Pares de conectores Ballun. Alimentação de vídeos de 3 cameras. ","type":"produto","price":60,"amount":60,"quantity":1},{"name":"3 conectores P4 alimentação de energia de 3 cameras. ","description":"3 conectores P4 alimentação de energia de 3 cameras. ","type":"produto","price":20,"amount":20,"quantity":1},{"name":"Infraestrutura de rede e Wi-Fi: instalada nova antena para cobertura do setor da piscina. Realizado o reposicionamento das antenas do restaurante, ampliando a qualidade do sinal. Toda a estrutura do restaurante e áreas próximas passou a ser alimentada diretamente pelo rack principal da recepção, reduzindo cascateamento e emendas no trajeto. Ajustado também o Wi-Fi destinado aos funcionários, que estava inoperante.","description":"Infraestrutura de rede e Wi-Fi: instalada nova antena para cobertura do setor da piscina. Realizado o reposicionamento das antenas do restaurante, ampliando a qualidade do sinal. Toda a estrutura do restaurante e áreas próximas passou a ser alimentada diretamente pelo rack principal da recepção, reduzindo cascateamento e emendas no trajeto. Ajustado também o Wi-Fi destinado aos funcionários, que estava inoperante.","type":"servico","price":400,"amount":400,"quantity":1},{"name":"Ajustes no sistema de CFTV: reposicionamento da câmera do corredor da cozinha para a área de leitura. No restaurante, realizado repasse do cabo, substituição dos conectores e instalação de nova câmera. Efetuados ajustes de posicionamento para melhorar os ângulos de captura e refeitos conectores de algumas câmeras, eliminando oxidação e aprimorando o sinal.","description":"Ajustes no sistema de CFTV: reposicionamento da câmera do corredor da cozinha para a área de leitura. No restaurante, realizado repasse do cabo, substituição dos conectores e instalação de nova câmera. Efetuados ajustes de posicionamento para melhorar os ângulos de captura e refeitos conectores de algumas câmeras, eliminando oxidação e aprimorando o sinal.","type":"servico","price":300,"amount":300,"quantity":1}]	62	\N	entrada	1859.00	pendente	\N	\N	2025-07-26 03:00:00	5	2025-08-21 11:12:54.595	\N	\N	\N	\N	\N		180	819.00	1040.00	[{"name":"Valor referente a combustível para locomoção Mossoró/Tibau e Tibau/Mossoró.","amount":50,"type":"servico"},{"name":"Valor referente alimentação/Jantar para dois técnicos do dia 25/07/25. ","amount":69,"type":"servico"},{"name":"Infraestrutura de rede e Wi-Fi: instalada nova antena para cobertura do setor da piscina. Realizado o reposicionamento das antenas do restaurante, ampliando a qualidade do sinal. Toda a estrutura do restaurante e áreas próximas passou a ser alimentada diretamente pelo rack principal da recepção, reduzindo cascateamento e emendas no trajeto. Ajustado também o Wi-Fi destinado aos funcionários, que estava inoperante.","amount":400,"type":"servico"},{"name":"Ajustes no sistema de CFTV: reposicionamento da câmera do corredor da cozinha para a área de leitura. No restaurante, realizado repasse do cabo, substituição dos conectores e instalação de nova câmera. Efetuados ajustes de posicionamento para melhorar os ângulos de captura e refeitos conectores de algumas câmeras, eliminando oxidação e aprimorando o sinal.","amount":300,"type":"servico"}]	[{"name":"200m de cabo rede CAT5.E 100% Cobre. ( Alimentação das antenas e câmera do restaurante direto para rack da recepção)","amount":800,"type":"produto"},{"name":"Câmera Bullet Intelbras HD ( P/ Restaurante)","amount":160,"type":"produto"},{"name":"3 Pares de conectores Ballun. Alimentação de vídeos de 3 cameras. ","amount":60,"type":"produto"},{"name":"3 conectores P4 alimentação de energia de 3 cameras. ","amount":20,"type":"produto"}]	\N	\N	2025-08-21 00:23:45.838892	\N	0.00	1
255	Serviço - \n\nDiscriminação de valores:\n\nServiços:\n- 4x Instalação, configuração e parametrização de antenas Ubiquiti Unifi Mesh. Atualização do servidor das antenas, agregando a novos recursos de melhoria no sistema.: R$ 800,00\n- 2x Ajuste de manutenção e configuração de duas câmeras.: R$ 0,00\n\nProdutos/Materiais:\n- 200M Cabos Lan/rede RJ45 CAT5.E Furukawa. : R$ 800,00\n- Comprado no material de construção em Tibau. Filtro de linha para alimentar antenas dentro do Rack, cabos de energia e adaptadores.: R$ 72,00\n- Gasolina ida e volta Tibau/Mossoró.: R$ 50,00\n- Valor referente à alimentação (jantar) de dois técnicos, durante dois dias de serviço.: R$ 100,00\n\n[{"name":"200M Cabos Lan/rede RJ45 CAT5.E Furukawa. ","description":"200M Cabos Lan/rede RJ45 CAT5.E Furukawa. ","type":"produto","price":800,"amount":800,"quantity":1},{"name":"Comprado no material de construção em Tibau. Filtro de linha para alimentar antenas dentro do Rack, cabos de energia e adaptadores.","description":"Comprado no material de construção em Tibau. Filtro de linha para alimentar antenas dentro do Rack, cabos de energia e adaptadores.","type":"produto","price":72,"amount":72,"quantity":1},{"name":"Gasolina ida e volta Tibau/Mossoró.","description":"Gasolina ida e volta Tibau/Mossoró.","type":"produto","price":50,"amount":50,"quantity":1},{"name":"Valor referente à alimentação (jantar) de dois técnicos, durante dois dias de serviço.","description":"Valor referente à alimentação (jantar) de dois técnicos, durante dois dias de serviço.","type":"produto","price":100,"amount":100,"quantity":1},{"name":"4x Instalação, configuração e parametrização de antenas Ubiquiti Unifi Mesh. Atualização do servidor das antenas, agregando a novos recursos de melhoria no sistema.","description":"4x Instalação, configuração e parametrização de antenas Ubiquiti Unifi Mesh. Atualização do servidor das antenas, agregando a novos recursos de melhoria no sistema.","type":"servico","price":800,"amount":800,"quantity":1},{"name":"2x Ajuste de manutenção e configuração de duas câmeras.","description":"2x Ajuste de manutenção e configuração de duas câmeras.","type":"servico","price":0.001,"amount":0.001,"quantity":1}]	62	\N	entrada	1822.00	pendente	\N	\N	2025-07-02 03:00:00	5	2025-08-21 11:13:43.683	\N	\N	\N	\N	\N	Pegar impressora na logos e comprar cabos de áudio RCA/P2. 	30	800.00	1022.00	[{"name":"4x Instalação, configuração e parametrização de antenas Ubiquiti Unifi Mesh. Atualização do servidor das antenas, agregando a novos recursos de melhoria no sistema.","amount":800,"type":"servico"},{"name":"2x Ajuste de manutenção e configuração de duas câmeras.","amount":0.001,"type":"servico"}]	[{"name":"200M Cabos Lan/rede RJ45 CAT5.E Furukawa. ","amount":800,"type":"produto"},{"name":"Comprado no material de construção em Tibau. Filtro de linha para alimentar antenas dentro do Rack, cabos de energia e adaptadores.","amount":72,"type":"produto"},{"name":"Gasolina ida e volta Tibau/Mossoró.","amount":50,"type":"produto"},{"name":"Valor referente à alimentação (jantar) de dois técnicos, durante dois dias de serviço.","amount":100,"type":"produto"}]	\N	\N	2025-08-21 00:26:47.083118	\N	0.00	1
269	Impressora Epson Setor ADM. Impressora falhando. Manutenção na cabeça de impressão e troca do tranque de tinta x tubulação azul. Serviço + peça. 	37	\N	entrada	300.00	pendente	\N	\N	2025-08-27 18:47:15.97	5	2025-08-27 18:48:49.74669	\N	\N	\N	\N	\N	\N	196	300.00	0.00	[{"name":"Impressora Epson Setor ADM. Impressora falhando. Manutenção na cabeça de impressão e troca do tranque de tinta x tubulação azul. Serviço + peça. ","amount":300,"type":"servico"}]	[]	\N	\N	2025-08-27 18:48:49.74669	\N	0.00	1
401	3/10 parcelamento investimento inicial sistema	\N	\N	saida	100.00	pago	\N	2025-09-25 01:27:03.017	2025-09-25 01:27:03.017	1	2025-09-25 01:27:03.174438	1	2025-09-25 01:27:03.017	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-25 01:27:03.174438	\N	0.00	1
273	Verificar algumas questões em uma das máquinas.\n\nDiscriminação de valores:\n\nServiços:\n- Visita técnica, complementada por acessos remotos, para diagnóstico e resolução de pendências. Realizados ajustes no sistema operacional Windows, configuração de e-mails no computador e celular da Adelaide, reinstalação e ativação do pacote Office, além de correção em planilhas de orçamento para permitir o cálculo automático da quantidade, valor unitário, total por item e total geral.: R$ 150,00\n\n[{"name":"Visita técnica, complementada por acessos remotos, para diagnóstico e resolução de pendências. Realizados ajustes no sistema operacional Windows, configuração de e-mails no computador e celular da Adelaide, reinstalação e ativação do pacote Office, além de correção em planilhas de orçamento para permitir o cálculo automático da quantidade, valor unitário, total por item e total geral.","description":"Visita técnica, complementada por acessos remotos, para diagnóstico e resolução de pendências. Realizados ajustes no sistema operacional Windows, configuração de e-mails no computador e celular da Adelaide, reinstalação e ativação do pacote Office, além de correção em planilhas de orçamento para permitir o cálculo automático da quantidade, valor unitário, total por item e total geral.","type":"servico","price":150,"amount":150,"quantity":1}]	94	\N	entrada	150.00	pendente	\N	\N	2025-08-21 11:03:37.812	5	2025-08-29 01:07:21.558683	\N	\N	\N	\N	\N	\N	191	150.00	0.00	[{"name":"Visita técnica, complementada por acessos remotos, para diagnóstico e resolução de pendências. Realizados ajustes no sistema operacional Windows, configuração de e-mails no computador e celular da Adelaide, reinstalação e ativação do pacote Office, além de correção em planilhas de orçamento para permitir o cálculo automático da quantidade, valor unitário, total por item e total geral.","amount":150,"type":"servico"}]	[]	\N	\N	2025-08-29 01:07:21.558683	\N	0.00	1
268	Laboratório Análises clínica. Problema nas impressoras.\nImpressora Brother HL1202, possivelmente problema na placa lógica. Não temos solução. \nProblema impressão de etiqueta, acontecia por causa do servidor de impressão Alvaro que precisa ser atualizado pra nova versão. Instalação Aptador Wi-fi/USB Desktop Dell no Laboratório.	8	\N	entrada	150.00	pendente	\N	\N	2025-08-27 03:00:00	5	2025-09-10 14:33:17.237	\N	\N	\N	\N	\N		194	120.00	0.00	[{"name":"Laboratório Análises clínica. Problema nas impressoras.\\nImpressora Brother HL1202, possivelmente problema na placa lógica. Não temos solução. \\nProblema impressão de etiqueta, acontecia por causa do servidor de impressão Alvaro que precisa ser atualizado pra nova versão. ","amount":120,"type":"servico"}]	[]	\N	\N	2025-08-27 18:48:16.237612	\N	0.00	1
410	Verificar note	105	\N	entrada	280.00	pendente	\N	\N	2025-09-18 19:10:04.416	5	2025-09-25 13:46:08.305735	\N	\N	\N	\N	\N	\N	244	280.00	0.00	[{"name":"Verificar note","amount":280,"type":"servico"}]	[]	\N	\N	2025-09-25 13:46:08.305735	\N	0.00	1
429	Acesso remoto para ajustes na impressora da recepção. Erro na Wi-fi, fila de impressão com vários erros e atolamento de papel. Resolvido. 	101	\N	entrada	50.00	pendente	\N	\N	2025-10-06 14:19:48.924	5	2025-10-06 14:20:18.251877	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Acesso remoto para ajustes na impressora da recepção. Erro na Wi-fi, fila de impressão com vários erros e atolamento de papel. Resolvido. : R$ 50,00\n\n[{"name":"Acesso remoto para ajustes na impressora da recepção. Erro na Wi-fi, fila de impressão com vários erros e atolamento de papel. Resolvido. ","description":"Acesso remoto para ajustes na impressora da recepção. Erro na Wi-fi, fila de impressão com vários erros e atolamento de papel. Resolvido. ","type":"servico","unitPrice":50,"price":50,"amount":50,"quantity":1}]	274	50.00	0.00	[{"name":"Acesso remoto para ajustes na impressora da recepção. Erro na Wi-fi, fila de impressão com vários erros e atolamento de papel. Resolvido. ","amount":50,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-10-06 14:20:18.251877	\N	0.00	1
274	Análise e Resolução – Bloqueio de IP Público\nRealizamos a análise de um problema que estava afetando o envio de e-mails, resultando em mensagens de erro. Foi identificado que o IP público fornecido pela Telecab havia sido incluído em uma blacklist, impedindo o envio normal dos e-mails.\nDurante a investigação, constatamos que a Telecab opera em modo CGNAT, onde diversos clientes compartilham o mesmo endereço de IP público. O bloqueio, portanto, foi ocasionado por atividades de outro cliente que utiliza o mesmo IP.\nApós contato com o provedor, realizamos a solicitação de alteração do IP, resultando na substituição por um endereço livre de restrições, restaurando o funcionamento normal do serviço de e-mail.	37	\N	entrada	250.00	pendente	\N	\N	2025-08-29 01:03:33.124	5	2025-08-29 01:09:53.390905	\N	\N	\N	\N	\N	\N	203	250.00	0.00	[{"name":"Análise e Resolução – Bloqueio de IP Público\\nRealizamos a análise de um problema que estava afetando o envio de e-mails, resultando em mensagens de erro. Foi identificado que o IP público fornecido pela Telecab havia sido incluído em uma blacklist, impedindo o envio normal dos e-mails.\\nDurante a investigação, constatamos que a Telecab opera em modo CGNAT, onde diversos clientes compartilham o mesmo endereço de IP público. O bloqueio, portanto, foi ocasionado por atividades de outro cliente que utiliza o mesmo IP.\\nApós contato com o provedor, realizamos a solicitação de alteração do IP, resultando na substituição por um endereço livre de restrições, restaurando o funcionamento normal do serviço de e-mail.","amount":250,"type":"servico"}]	[]	\N	\N	2025-08-29 01:09:53.390905	\N	0.00	1
275	Medical Center – Visita Técnica\nRealizada análise nos dois scanners. Equipamentos apresentavam desgaste; impressoras adaptadas para uso como scanner. Um equipamento foi normalizado; o outro apresentou falha na placa lógica, tornando o reparo inviável.	28	\N	entrada	100.00	pendente	\N	\N	2025-08-29 01:02:49.153	5	2025-08-29 01:10:22.553218	\N	\N	\N	\N	\N	\N	201	100.00	0.00	[{"name":"Medical Center – Visita Técnica\\nRealizada análise nos dois scanners. Equipamentos apresentavam desgaste; impressoras adaptadas para uso como scanner. Um equipamento foi normalizado; o outro apresentou falha na placa lógica, tornando o reparo inviável.","amount":100,"type":"servico"}]	[]	\N	\N	2025-08-29 01:10:22.553218	\N	0.00	1
277	Ajustes no sistema de câmeras, CPU jornalismo e...\n\nDiscriminação de valores:\n\nServiços:\n- Reparo na tomada de rede do roteador AduernSede4: R$ 50,00\n- Reparo no sistema operacional CPU jornalismo e atualizações do sistema: R$ 100,00\n- Visita técnica para ajustes no sistema de câmeras e substituição da fonte de alimentação. Na ocasião, o sistema não estava gravando e foi feito um ajuste no sistema do DVR e a reposição da fonte.: R$ 100,00\n- Mudança do local do roteador AduernSede3 (roteador do salão de eventos): R$ 150,00\n- Visita técnica para instalação do novo nobreak no sistema de câmeras e rede: R$ 100,00\n\nProdutos/Materiais:\n- Fonte de alimentação para o DVR (sistema de câmeras): R$ 80,00\n- Cabo de rede RJ 45 5 mts: R$ 25,00\n- Visita técnica para ajustes na rede e mudanças nos roteadores: R$ 100,00\n- No break Intelbras Attiv 700 VA: R$ 600,00\n\n[{"name":"Reparo na tomada de rede do roteador AduernSede4","amount":50,"type":"servico"},{"name":"Reparo no sistema operacional CPU jornalismo e atualizações do sistema","amount":100,"type":"servico"},{"name":"Visita técnica para ajustes no sistema de câmeras e substituição da fonte de alimentação. Na ocasião, o sistema não estava gravando e foi feito um ajuste no sistema do DVR e a reposição da fonte.","amount":100,"type":"servico"},{"name":"Fonte de alimentação para o DVR (sistema de câmeras)","amount":80,"type":"produto"},{"name":"Cabo de rede RJ 45 5 mts","amount":25,"type":"produto"},{"name":"Visita técnica para ajustes na rede e mudanças nos roteadores","amount":100,"type":"produto"},{"name":"Mudança do local do roteador AduernSede3 (roteador do salão de eventos)","description":"Mudança do local do roteador AduernSede3 (roteador do salão de eventos)","type":"servico","price":150,"amount":150,"quantity":1},{"name":"No break Intelbras Attiv 700 VA","description":"No break Intelbras Attiv 700 VA","type":"produto","price":600,"amount":600,"quantity":1},{"name":"Visita técnica para instalação do novo nobreak no sistema de câmeras e rede","description":"Visita técnica para instalação do novo nobreak no sistema de câmeras e rede","type":"servico","price":100,"amount":100,"quantity":1}]	14	\N	entrada	1305.00	pago	\N	2025-10-16 13:27:53.93	2025-08-29 18:19:21.205	1	2025-10-16 13:27:54.783	1	\N	\N	\N	\N	Ajustes no sistema de câmeras, CPU jornalismo e roteadores sede 2, 3 e 4	206	500.00	805.00	[{"name":"Reparo na tomada de rede do roteador AduernSede4","amount":50,"type":"servico"},{"name":"Reparo no sistema operacional CPU jornalismo e atualizações do sistema","amount":100,"type":"servico"},{"name":"Visita técnica para ajustes no sistema de câmeras e substituição da fonte de alimentação. Na ocasião, o sistema não estava gravando e foi feito um ajuste no sistema do DVR e a reposição da fonte.","amount":100,"type":"servico"},{"name":"Mudança do local do roteador AduernSede3 (roteador do salão de eventos)","amount":150,"type":"servico"},{"name":"Visita técnica para instalação do novo nobreak no sistema de câmeras e rede","amount":100,"type":"servico"}]	[{"name":"Fonte de alimentação para o DVR (sistema de câmeras)","amount":80,"type":"produto"},{"name":"Cabo de rede RJ 45 5 mts","amount":25,"type":"produto"},{"name":"Visita técnica para ajustes na rede e mudanças nos roteadores","amount":100,"type":"produto"},{"name":"No break Intelbras Attiv 700 VA","amount":600,"type":"produto"}]	\N	\N	2025-09-03 13:45:57.888586	\N	0.00	1
466	Parcela 3/5 - Roteador Intelbras configurado com a rede clientes na João da Escóssia. Discriminação de valores: Produtos/Materiais: - Roteador Intelbras configurado com a rede clientes na João da Escóssia.	28	\N	entrada	30.00	pendente	\N	\N	2025-09-10 03:00:00	5	2025-10-17 15:46:00.799	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-10-17 13:41:18.015828	\N	0.00	1
285	Instalação do pacote Office 2019 remoto	102	\N	entrada	50.00	pago	\N	2025-09-25 01:56:59.306	2025-09-06 03:00:00	7	2025-09-25 01:56:59.63	1	\N	\N	\N	\N	\N	227	50.00	0.00	[{"name":"Instalação do pacote Office 2019 remoto","amount":50,"type":"servico"}]	[]	\N	\N	2025-09-06 12:58:57.746779	\N	0.00	1
494	Impressora Epson L5190 - Manutenção, limpeza interna, lubrificação, desentupimento da tubulação e cabeça de impressão, troca das almofadas do descarte e reset. 	127	319	entrada	220.00	pendente	\N	\N	2025-05-05 03:00:00	5	2025-10-31 15:42:11.316838	\N	\N	\N	\N	\N	\N	323	220.00	0.00	[{"name":"Impressora Epson L5190 - Manutenção, limpeza interna, lubrificação, desentupimento da tubulação e cabeça de impressão, troca das almofadas do descarte e reset. ","amount":220,"type":"servico"}]	[]	\N	\N	2025-10-31 15:42:11.316838	\N	0.00	1
292	Orientação de baixanarquivo XML. 	15	\N	entrada	50.00	pendente	\N	\N	2025-09-02 14:18:05.707	5	2025-09-09 19:50:46.047291	\N	\N	\N	\N	\N	\N	210	50.00	0.00	[{"name":"Orientação de baixanarquivo XML. ","amount":50,"type":"servico"}]	[]	\N	\N	2025-09-09 19:50:46.047291	\N	0.00	1
518	Almoço amigas pos cia da fórmula	\N	\N	saida	50.00	pago	\N	2025-11-22 00:53:35.023	2025-11-22 03:00:00	1	2025-11-22 00:53:35.676	1	2025-11-22 00:23:03.725	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-11-22 00:23:03.976416	\N	0.00	1
297	Desktop travando e desligando. 	97	\N	entrada	250.00	pendente	\N	\N	2025-08-27 18:43:11.819	5	2025-09-10 04:00:57.282959	\N	\N	\N	\N	\N	\N	195	250.00	0.00	[{"name":"Desktop travando e desligando. ","amount":250,"type":"servico"}]	[]	\N	\N	2025-09-10 04:00:57.282959	\N	0.00	1
503	Pc Lenovo para Alan do Rock na presença	\N	\N	entrada	300.00	pago	\N	2025-11-03 11:18:51.864	2025-10-28 03:00:00	1	2025-11-03 11:18:51.81	1	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-11-03 11:18:04.77942	\N	0.00	1
289	Peça, SSD 240gb + Serviço de Backup, Formatação, instalações, atualização e configuração do sistema operacional e programas.	23	\N	entrada	370.00	pago	\N	2025-09-18 19:21:35.396	2025-09-09 19:27:26.118	5	2025-09-18 19:21:36.272	9	\N	\N	\N	\N	\N	229	370.00	0.00	[{"name":"Peça, SSD 240gb + Serviço de Backup, Formatação, instalações, atualização e configuração do sistema operacional e programas.","amount":370,"type":"servico"}]	[]	\N	\N	2025-09-09 19:34:01.875465	\N	0.00	1
402	1/3 primeira parcela rolo 500 MTS fibra óptica AFIM 	\N	\N	saida	100.00	pago	\N	2025-09-25 01:27:39.996	2025-09-25 01:27:39.996	1	2025-09-25 01:27:40.188796	1	2025-09-25 01:27:39.996	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-25 01:27:40.188796	\N	0.00	1
411	Visita técnica para analisar mudanças de local das máquinas. 	104	\N	entrada	248.00	pendente	\N	\N	2025-09-23 13:25:54.229	5	2025-09-25 13:50:32.629069	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- 2x Visita técnica para passagem de cabo de rede novo com canaletas ficados na parede para atender novo formato. E fazer ligação dos PCs na rede no dia da mudança.  (R$ 80,00 cada): R$ 160,00\n\nProdutos/Materiais:\n- 3x Canaletas para passagem do cabo no novo local.  (R$ 16,00 cada): R$ 48,00\n- 10x Cabo de rede RJ45 CAT6. (R$ 4,00 cada): R$ 40,00\n\n[{"name":"Visita técnica para passagem de cabo de rede novo com canaletas ficados na parede para atender novo formato. E fazer ligação dos PCs na rede no dia da mudança. ","description":"Visita técnica para passagem de cabo de rede novo com canaletas ficados na parede para atender novo formato. E fazer ligação dos PCs na rede no dia da mudança. ","type":"servico","unitPrice":80,"price":160,"amount":160,"quantity":2},{"name":"Canaletas para passagem do cabo no novo local. ","description":"Canaletas para passagem do cabo no novo local. ","type":"produto","unitPrice":16,"price":48,"amount":48,"quantity":3},{"name":"Cabo de rede RJ45 CAT6.","description":"Cabo de rede RJ45 CAT6.","type":"produto","unitPrice":4,"price":40,"amount":40,"quantity":10}]	254	160.00	88.00	[{"name":"Visita técnica para passagem de cabo de rede novo com canaletas ficados na parede para atender novo formato. E fazer ligação dos PCs na rede no dia da mudança. ","amount":160,"quantity":2,"type":"servico"}]	[{"name":"Canaletas para passagem do cabo no novo local. ","amount":48,"quantity":3,"type":"produto"},{"name":"Cabo de rede RJ45 CAT6.","amount":40,"quantity":10,"type":"produto"}]	\N	\N	2025-09-25 13:50:32.629069	\N	0.00	1
383	Verificar impressora Epson da recepção.	24	\N	entrada	185.00	pendente	\N	\N	2025-09-15 03:00:00	5	2025-10-07 04:05:15.402	\N	\N	\N	\N	\N	Verificar impressora Epson da recepção.\n\nDiscriminação de valores:\n\nServiços:\n- Epson Recepção - Manutenção preventiva, limpeza e lubrificação. Desentupimento da cabeça de impressão e reparo na placa lógica com troca de componentes. : R$ 185,00\n\n[{"name":"Epson Recepção - Manutenção preventiva, limpeza e lubrificação. Desentupimento da cabeça de impressão e reparo na placa lógica com troca de componentes. ","description":"Epson Recepção - Manutenção preventiva, limpeza e lubrificação. Desentupimento da cabeça de impressão e reparo na placa lógica com troca de componentes. ","type":"servico","unitPrice":185,"price":185,"amount":185,"quantity":1}]	245	185.00	0.00	[{"name":"Epson Recepção - Manutenção preventiva, limpeza e lubrificação. Desentupimento da cabeça de impressão e reparo na placa lógica com troca de componentes. ","amount":185,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-09-18 19:26:11.063082	\N	0.00	1
295	Progel Bahia,\nAnálise e Resolução – Bloqueio de IP Público\nRealizamos a análise de um problema que estava afetando o envio de e-mails, resultando em mensagens de erro. Foi identificado que o IP público fornecido pela Telecab havia sido incluído em uma blacklist, impedindo o envio normal dos e-mails.\nDurante a investigação, constatamos que a Telecab opera em modo CGNAT, onde diversos clientes compartilham o mesmo endereço de IP público. O bloqueio, portanto, foi ocasionado por atividades de outro cliente que utiliza o mesmo IP.\nApós contato com o provedor, realizamos a solicitação de alteração do IP, resultando na substituição por um endereço livre de restrições, restaurando o funcionamento normal do serviço de e-mail.	37	\N	entrada	250.00	pendente	\N	\N	2025-08-29 01:03:35.294	5	2025-09-10 03:59:53.500472	\N	\N	\N	\N	\N	\N	204	250.00	0.00	[{"name":"Progel Bahia,\\nAnálise e Resolução – Bloqueio de IP Público\\nRealizamos a análise de um problema que estava afetando o envio de e-mails, resultando em mensagens de erro. Foi identificado que o IP público fornecido pela Telecab havia sido incluído em uma blacklist, impedindo o envio normal dos e-mails.\\nDurante a investigação, constatamos que a Telecab opera em modo CGNAT, onde diversos clientes compartilham o mesmo endereço de IP público. O bloqueio, portanto, foi ocasionado por atividades de outro cliente que utiliza o mesmo IP.\\nApós contato com o provedor, realizamos a solicitação de alteração do IP, resultando na substituição por um endereço livre de restrições, restaurando o funcionamento normal do serviço de e-mail.","amount":250,"type":"servico"}]	[]	\N	\N	2025-09-10 03:59:53.500472	\N	0.00	1
470	Brother digitação dcp 8512dn. Reposicao de toner e cilindro. 	9	292	entrada	350.00	pendente	\N	\N	2025-10-22 04:13:51.1	5	2025-10-22 04:25:37.95503	\N	\N	\N	\N	\N	\N	301	350.00	0.00	[{"name":"Brother digitação dcp 8512dn. Reposicao de toner e cilindro. ","amount":350,"type":"servico"}]	[]	\N	\N	2025-10-22 04:25:37.95503	\N	0.00	1
471	Foi desativado a bateria que estava causando falhas ao funcionamento da máquina.	120	290	entrada	100.00	pendente	\N	\N	2025-10-22 04:14:59.205	5	2025-10-22 04:25:45.315976	\N	\N	\N	\N	\N	\N	302	100.00	0.00	[{"name":"Foi desativado a bateria que estava causando falhas ao funcionamento da máquina.","amount":100,"type":"servico"}]	[]	\N	\N	2025-10-22 04:25:45.315976	\N	0.00	1
489	Impressora entupida. 	103	309	entrada	150.00	pendente	\N	\N	2025-10-30 14:50:27.844	5	2025-10-31 14:11:32.567166	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Manutenção Impressora Epson L121 - Limpeza interna, lubrificação, desentupimento das tubulações e cabeça de impressão. Reset do sistema da impressora. : R$ 150,00\n\n[{"name":"Manutenção Impressora Epson L121 - Limpeza interna, lubrificação, desentupimento das tubulações e cabeça de impressão. Reset do sistema da impressora. ","description":"Manutenção Impressora Epson L121 - Limpeza interna, lubrificação, desentupimento das tubulações e cabeça de impressão. Reset do sistema da impressora. ","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1}]	317	150.00	0.00	[{"name":"Manutenção Impressora Epson L121 - Limpeza interna, lubrificação, desentupimento das tubulações e cabeça de impressão. Reset do sistema da impressora. ","amount":150,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-10-31 14:11:32.567166	\N	0.00	1
504	Nota Dr Sérgio serviços sistema antigo	31	\N	entrada	420.00	pago	\N	2025-11-03 17:25:16.378	2025-11-03 17:25:07.822	1	2025-11-03 17:25:16.323	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-03 17:25:08.353159	\N	0.00	1
473	Filtro de linha desligado. Apenas aperta um botão.	100	285	entrada	100.00	pago	\N	2025-10-22 04:29:57.593	2025-10-22 04:15:43.032	5	2025-10-22 04:29:56.249	9	\N	\N	\N	\N	\N	303	100.00	0.00	[{"name":"Filtro de linha desligado. Apenas aperta um botão.","amount":100,"type":"servico"}]	[]	\N	\N	2025-10-22 04:26:04.957407	\N	0.00	1
296	Visita técnica para reconfigurar servidor DICOM na USG Sala 3. 	8	\N	entrada	200.00	pendente	\N	\N	2025-09-02 19:51:37.67	5	2025-09-10 04:00:29.86528	\N	\N	\N	\N	\N	\N	211	200.00	0.00	[{"name":"Visita técnica para reconfigurar servidor DICOM na USG Sala 3. ","amount":200,"type":"servico"}]	[]	\N	\N	2025-09-10 04:00:29.86528	\N	0.00	1
304	Identificados múltiplos problemas na rede: limitação do link Telecab por pendência de pagamento; conflito de IP entre ONU Telecab e equipamento Multilaser não localizado (solucionado com alteração do IP da ONU pela operadora); falha no cabo LAN da Brisanet impedindo failover automático. Realizado ajuste emergencial deixando Brisanet direto no switch. Retorno programado para normalizar configuração no servidor pfSense com failover e load balance.	37	\N	entrada	350.00	pendente	\N	\N	2025-09-10 14:10:05.963	5	2025-09-10 14:10:16.511247	\N	\N	\N	\N	\N	\N	236	350.00	0.00	[{"name":"Identificados múltiplos problemas na rede: limitação do link Telecab por pendência de pagamento; conflito de IP entre ONU Telecab e equipamento Multilaser não localizado (solucionado com alteração do IP da ONU pela operadora); falha no cabo LAN da Brisanet impedindo failover automático. Realizado ajuste emergencial deixando Brisanet direto no switch. Retorno programado para normalizar configuração no servidor pfSense com failover e load balance.","amount":350,"type":"servico"}]	[]	\N	\N	2025-09-10 14:10:16.511247	\N	0.00	1
403	8/12 parcela prejuízo Forex compartilhado	\N	\N	saida	475.00	pago	\N	2025-09-25 01:28:16.255	2025-09-25 01:28:16.255	1	2025-09-25 01:28:16.416673	1	2025-09-25 01:28:16.255	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-25 01:28:16.416673	\N	0.00	1
412	Almoço amigas	\N	\N	saida	50.00	pago	\N	2025-09-25 16:14:13.385	2025-09-25 16:14:13.385	1	2025-09-25 16:14:13.545978	1	2025-09-25 16:14:13.385	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-25 16:14:13.545978	\N	0.00	1
413	Erro na impressora do setor de eletro. A máquina apresentou problemas em duas portas USBs, com isso fizemos a troca de lugar por uma de outro setor, que poderia trabalhar normalmente com duas portas USBs a menos.	8	\N	entrada	150.00	pendente	\N	\N	2025-09-25 03:00:00	5	2025-09-25 20:44:46.863878	\N	\N	\N	\N	\N	\N	263	150.00	0.00	[{"name":"Erro na impressora do setor de eletro. A máquina apresentou problemas em duas portas USBs, com isso fizemos a troca de lugar por uma de outro setor, que poderia trabalhar normalmente com duas portas USBs a menos.","amount":150,"type":"servico"}]	[]	\N	\N	2025-09-25 20:44:46.863878	\N	0.00	1
415	Visita técnica para identificar e resolver problema de rede no Pc Soleya. Problema do cabo de rede partido, foi tirado algumas emendas e refeitos os conectores. 	55	\N	entrada	100.00	pendente	\N	\N	2025-09-26 03:00:00	5	2025-09-26 16:14:53.32	\N	\N	\N	\N	\N		264	100.00	0.00	[{"name":"Visita técnica para identificar e resolver problema de rede no Pc Soleya. Problema do cabo de rede partido, foi tirado algumas imensas e refeitos os conectores. ","amount":100,"type":"servico"}]	[]	\N	\N	2025-09-26 16:12:55.351233	\N	0.00	1
416	Parcela 3 - Parcelamento avulso materiais e serviços 	21	\N	entrada	100.00	pago	\N	2025-09-26 21:29:07.825	2025-09-26 21:29:07.826	1	2025-09-26 21:29:07.844516	1	\N	377	3	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-26 21:29:07.844516	\N	0.00	1
417	Acesso remoto para ajustes na configuração das impressoras de rede	43	\N	entrada	50.00	pago	\N	2025-09-27 13:38:59.792	2025-09-27 12:58:52.67	1	2025-09-27 13:38:59.117	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-27 12:58:52.836413	\N	0.00	1
418	CPU Sueli deu problema, espera 2. Deivinho colocou um outro Pc do whatsapp enquanto a gente vai ajeitar o dela.	8	\N	entrada	200.00	pendente	\N	\N	2025-09-24 20:38:02.383	1	2025-09-29 12:46:52.744031	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Serviço de diagnóstico e substituição do componente danificado e testes no equipamento: R$ 80,00\n\nProdutos/Materiais:\n- Fonte ATX 24 p 12v: R$ 120,00\n\n[{"name":"Fonte ATX 24 p 12v","description":"Fonte ATX 24 p 12v","type":"produto","unitPrice":120,"price":120,"amount":120,"quantity":1},{"name":"Serviço de diagnóstico e substituição do componente danificado e testes no equipamento","description":"Serviço de diagnóstico e substituição do componente danificado e testes no equipamento","type":"servico","unitPrice":80,"price":80,"amount":80,"quantity":1}]	259	80.00	120.00	[{"name":"Serviço de diagnóstico e substituição do componente danificado e testes no equipamento","amount":80,"quantity":1,"type":"servico"}]	[{"name":"Fonte ATX 24 p 12v","amount":120,"quantity":1,"type":"produto"}]	\N	\N	2025-09-29 12:46:52.744031	\N	0.00	1
419	Acesso remoto de urgência para configuração de Pc temporário para Dr. Arturo.	8	\N	entrada	50.00	pendente	\N	\N	2025-09-29 12:53:00.045	5	2025-09-29 12:53:10.560322	\N	\N	\N	\N	\N	\N	265	50.00	0.00	[{"name":"Acesso remoto de urgência para configuração de Pc temporário para Dr. Arturo.","amount":50,"type":"servico"}]	[]	\N	\N	2025-09-29 12:53:10.560322	\N	0.00	1
302	Upgrade CPU\nItens: Backup, formatação, instalação, configuração e atualização do sistema operacional e programas. Substituição do HD por SSD e instalação de mais 4gb de memória RAM.  - R$ 150; SSD SATA KingSpec 256GB (1 ANO GARANTIA )  - R$ 225; Memória RAM  Kingston DDR3 4GB 1333GHz. (1 ANO GARANTIA ) - R$ 150	99	\N	entrada	474.25	pago	\N	2025-09-18 19:21:10.974	2025-09-10 03:00:00	5	2025-09-18 19:21:12.001	9	\N	\N	\N	\N	\n\n--- DESCONTO APLICADO ---\nValor original: R$ 525,00\nDesconto: R$ 50,75\nValor final: R$ 474,25	\N	\N	\N	\N	\N	\N	\N	2025-09-10 04:34:30.840469	525.00	50.75	1
422	Restante, valor serviço da rede.	87	\N	entrada	300.00	pendente	\N	\N	2025-05-30 03:00:00	5	2025-09-30 15:04:26.867598	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Restante do valor referente a serviços de rede inicial. : R$ 300,00\n\n[{"name":"Restante do valor referente a serviços de rede inicial. ","description":"Restante do valor referente a serviços de rede inicial. ","type":"servico","unitPrice":300,"price":300,"amount":300,"quantity":1}]	266	300.00	0.00	[{"name":"Restante do valor referente a serviços de rede inicial. ","amount":300,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-09-30 15:04:26.867598	\N	0.00	1
242	Pegar note para análise de lentidão e barulho.\n\nDiscriminação de valores:\n\nServiços:\n- Diagnóstico e resolução de ruído e lentidão. Realizada limpeza interna, desoxidação das placas, substituição da pasta térmica e lubrificação do cooler. Efetuada também a troca da memória RAM.: R$ 100,00\n\nProdutos/Materiais:\n- Memória RAM DDR3 8GB 12800U: R$ 210,00\n\n[{"name":"Memória RAM DDR3 8GB 12800U","description":"Memória RAM DDR3 8GB 12800U","type":"produto","price":210,"amount":210,"quantity":1},{"name":"Diagnóstico e resolução de ruído e lentidão. Realizada limpeza interna, desoxidação das placas, substituição da pasta térmica e lubrificação do cooler. Efetuada também a troca da memória RAM.","description":"Diagnóstico e resolução de ruído e lentidão. Realizada limpeza interna, desoxidação das placas, substituição da pasta térmica e lubrificação do cooler. Efetuada também a troca da memória RAM.	24	\N	entrada	300.00	pendente	\N	\N	2025-08-17 03:00:00	5	2025-10-07 04:03:15.202	\N	\N	\N	\N	\N		179	100.00	210.00	[{"name":"Diagnóstico e resolução de ruído e lentidão. Realizada limpeza interna, desoxidação das placas, substituição da pasta térmica e lubrificação do cooler. Efetuada também a troca da memória RAM.","amount":100,"type":"servico"}]	[{"name":"Memória RAM DDR3 8GB 12800U","amount":210,"type":"produto"}]	\N	\N	2025-08-18 19:50:16.236594	\N	0.00	1
404	Capacitor impressora m1120 NGO 	\N	\N	saida	10.00	pago	\N	2025-09-25 01:28:49.419	2025-09-25 01:28:49.419	1	2025-09-25 01:28:49.573607	1	2025-09-25 01:28:49.419	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-25 01:28:49.573607	\N	0.00	1
423	Manutenção preventiva e corretiva, com reinstalação do sistema operacional e programas personalizados para o Pc/Projetor. 	87	\N	entrada	350.00	pendente	\N	\N	2025-05-30 03:00:00	5	2025-09-30 20:09:50.646	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Manutenção preventiva e corretiva, com reinstalação do sistema operacional e programas personalizados para o Pc/Projetor. : R$ 350,00\n\n[{"name":"Manutenção preventiva e corretiva, com reinstalação do sistema operacional e programas personalizados para o Pc/Projetor. ","description":"Manutenção preventiva e corretiva, com reinstalação do sistema operacional e programas personalizados para o Pc/Projetor. ","type":"servico","unitPrice":350,"price":350,"amount":350,"quantity":1}]	267	350.00	0.00	[{"name":"Manutenção preventiva e corretiva, com reinstalação do sistema operacional e programas personalizados para o Pc/Projetor. ","amount":350,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-09-30 15:04:33.450631	\N	0.00	1
476	Digitação, Impressora Brother DCP 1617NW, troca do DR/Cilindro. 	9	296	entrada	180.00	pendente	\N	\N	2025-09-25 03:00:00	5	2025-10-22 04:28:03.553217	\N	\N	\N	\N	\N	\N	306	180.00	0.00	[{"name":"Digitação, Impressora Brother DCP 1617NW, troca do DR/Cilindro. ","amount":180,"type":"servico"}]	[]	\N	\N	2025-10-22 04:28:03.553217	\N	0.00	1
432	ROTINA DE BACKUP DOS BANCO DE DADOS.	8	\N	entrada	100.00	pendente	\N	\N	2025-09-01 03:00:00	5	2025-10-08 15:56:54.799	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	2025-10-08 15:54:54.342256	\N	0.00	1
426	Monitor Dell 19" setor RH Saul	11	\N	entrada	750.00	pago	\N	2025-10-08 17:32:26.161	2025-10-01 20:18:19.557	1	2025-10-08 17:32:26.229	1	\N	\N	\N	\N	Monitor Dell 19" setor RH Saul\n\nDiscriminação de valores:\n\nServiços:\n- Instalação SSD 128 GB, formatação, instalação windows 10 e pacote de programas e atualizações : R$ 150,00\n\nProdutos/Materiais:\n- Monitor Dell 19" HD: R$ 450,00\n- SSD 128 GB notebook setor administrativo: R$ 150,00\n\n[{"name":"Monitor Dell 19\\" HD","description":"Monitor Dell 19\\" HD","type":"produto","unitPrice":450,"price":450,"amount":450,"quantity":1},{"name":"SSD 128 GB notebook setor administrativo","description":"SSD 128 GB notebook setor administrativo","type":"produto","unitPrice":150,"price":150,"amount":150,"quantity":1},{"name":"Instalação SSD 128 GB, formatação, instalação windows 10 e pacote de programas e atualizações ","description":"Instalação SSD 128 GB, formatação, instalação windows 10 e pacote de programas e atualizações ","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1}]	271	150.00	600.00	[{"name":"Instalação SSD 128 GB, formatação, instalação windows 10 e pacote de programas e atualizações ","amount":150,"quantity":1,"type":"servico"}]	[{"name":"Monitor Dell 19\\" HD","amount":450,"quantity":1,"type":"produto"},{"name":"SSD 128 GB notebook setor administrativo","amount":150,"quantity":1,"type":"produto"}]	\N	\N	2025-10-01 20:21:54.268997	\N	0.00	1
479	Notebook com erro na inicialização do Windows	119	286	entrada	300.00	pago	\N	2025-10-22 16:29:17.222	2025-10-20 16:10:57.166	1	2025-10-22 16:29:17.283	1	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Backup, instalação Windows 11 e demais programas e atualizações : R$ 150,00\n\nProdutos/Materiais:\n- SSD 120 GB : R$ 150,00\n- Limpeza interna com substituição de pasta térmica do processador : R$ 0,00\n\n[{"name":"SSD 120 GB ","description":"SSD 120 GB ","type":"produto","unitPrice":150,"price":150,"amount":150,"quantity":1},{"name":"Backup, instalação Windows 11 e demais programas e atualizações ","description":"Backup, instalação Windows 11 e demais programas e atualizações ","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1},{"name":"Limpeza interna com substituição de pasta térmica do processador ","description":"Limpeza interna com substituição de pasta térmica do processador ","type":"produto","unitPrice":0,"price":0,"amount":0,"quantity":1}]	294	150.00	150.00	[{"name":"Backup, instalação Windows 11 e demais programas e atualizações ","amount":150,"quantity":1,"type":"servico"}]	[{"name":"SSD 120 GB ","amount":150,"quantity":1,"type":"produto"},{"name":"Limpeza interna com substituição de pasta térmica do processador ","amount":0,"quantity":1,"type":"produto"}]	\N	\N	2025-10-22 16:28:57.788481	\N	0.00	1
475	Digitação, Impressora Hp P1102, efetuado a troca do rolete tracionador de papel. 	9	252	entrada	180.00	pendente	\N	\N	2025-09-25 03:00:00	5	2025-10-22 18:33:36.999	\N	\N	\N	\N	\N		305	180.00	0.00	[{"name":"Digitação, Impressora Hp P1102, efetuado a troca do rolete tracionador de papel. ","amount":180,"type":"servico"}]	[]	\N	\N	2025-10-22 04:27:48.804813	\N	0.00	1
486	Instalar e configurar StarLink	87	254	entrada	150.00	pendente	\N	\N	2025-10-29 16:11:36.535	5	2025-10-30 14:46:15.190104	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Visita técnica seguindo de acessos remotos para alinhar, instalar e configurar link StarLink dentro do Mikrotik da escada. Com configurações de rotas, Failover e loadbalance entre os dois links da escola. : R$ 150,00\n\n[{"name":"Visita técnica seguindo de acessos remotos para alinhar, instalar e configurar link StarLink dentro do Mikrotik da escada. Com configurações de rotas, Failover e loadbalance entre os dois links da escola. ","description":"Visita técnica seguindo de acessos remotos para alinhar, instalar e configurar link StarLink dentro do Mikrotik da escada. Com configurações de rotas, Failover e loadbalance entre os dois links da escola. ","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1}]	315	150.00	0.00	[{"name":"Visita técnica seguindo de acessos remotos para alinhar, instalar e configurar link StarLink dentro do Mikrotik da escada. Com configurações de rotas, Failover e loadbalance entre os dois links da escola. ","amount":150,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-10-30 14:46:15.190104	\N	0.00	1
490	Reparo carcaça e dobradiças SSD 240 + baixa	118	284	entrada	450.00	pendente	\N	\N	2025-10-20 03:00:00	5	2025-10-31 14:11:54.991986	\N	\N	\N	\N	\N	\N	295	450.00	0.00	[{"name":"Reparo carcaça e dobradiças SSD 240 + baixa","amount":450,"type":"servico"}]	[]	\N	\N	2025-10-31 14:11:54.991986	\N	0.00	1
484	Epson L355 - Manutenção preventiva e corretiva. Limpeza interna e lubrificação. Desentupimento da cabeça de impressão, remoção do ar das tubulações.	123	\N	entrada	300.00	pendente	\N	\N	2025-10-29 13:10:11.169	5	2025-10-29 13:11:09.535353	\N	\N	\N	\N	\N	Epson L355 - Manutenção preventiva e corretiva. Limpeza interna e lubrificação. Desentupimento da cabeça de impressão, remoção do ar das tubulações.\n\nDiscriminação de valores:\n\nServiços:\n- Epson L355 - Manutenção preventiva e corretiva. Limpeza interna e lubrificação. Desentupimento da cabeça de impressão, remoção do ar das tubulações.: R$ 150,00\n- Epson L3150 - Manutenção preventiva e corretiva. Limpeza interna e lubrificação. Desentupimento da cabeça de impressão, remoção do ar das tubulações.: R$ 150,00\n\n[{"name":"Epson L355 - Manutenção preventiva e corretiva. Limpeza interna e lubrificação. Desentupimento da cabeça de impressão, remoção do ar das tubulações.","amount":150,"quantity":1,"type":"servico"},{"name":"Epson L3150 - Manutenção preventiva e corretiva. Limpeza interna e lubrificação. Desentupimento da cabeça de impressão, remoção do ar das tubulações.","description":"Epson L3150 - Manutenção preventiva e corretiva. Limpeza interna e lubrificação. Desentupimento da cabeça de impressão, remoção do ar das tubulações.","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1}]	312	300.00	0.00	[{"name":"Epson L355 - Manutenção preventiva e corretiva. Limpeza interna e lubrificação. Desentupimento da cabeça de impressão, remoção do ar das tubulações.","amount":150,"quantity":1,"type":"servico"},{"name":"Epson L3150 - Manutenção preventiva e corretiva. Limpeza interna e lubrificação. Desentupimento da cabeça de impressão, remoção do ar das tubulações.","amount":150,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-10-29 13:11:09.535353	\N	0.00	1
1168	Visita técnica para fazer instalação de Switch e ajustes na rede, garantindo que todos os computadores da clínica tenham internet e acesso ao sistema Doctors	26	\N	entrada	90.00	pago	\N	2025-12-02 20:31:49.963	2025-11-27 12:35:44.852	1	2025-12-02 20:31:50.193	1	\N	\N	\N	\N	Visita técnica para fazer instalação de roteador principal e ajustes na rede, garantindo que todos os computadores da clínica tenham internet e acesso ao sistema Doctors\n\nDiscriminação de valores:\n\nServiços:\n- Visita técnica para ajustes na rede e instalação de switch: R$ 100,00\n\n[{"name":"Visita técnica para ajustes na rede e instalação de switch","amount":100,"quantity":1,"type":"servico"}]\n\n--- DESCONTO APLICADO ---\nValor original: R$ 100,00\nDesconto: R$ 10,00\nValor final: R$ 90,00	482	100.00	0.00	[{"name":"Visita técnica para ajustes na rede e instalação de switch","amount":100,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-11-27 12:35:44.871236	100.00	10.00	1
1143	Verificar máquina de Wigno depósito	67	153	entrada	100.00	pendente	\N	\N	2025-11-25 03:18:14.689	1	2025-11-29 10:50:09.692	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Visita técnica para verificar o desktop Dell do depósito, realizar a troca da bateria CMOS e reconfigurar a BIOS.: R$ 80,00\n\nProdutos/Materiais:\n- Bateria Intelbras CR2032 CMOS P/Desktop Desposto.: R$ 20,00\n\n[{"name":"Visita técnica para verificar o desktop Dell do depósito, realizar a troca da bateria CMOS e reconfigurar a BIOS.","description":"Visita técnica para verificar o desktop Dell do depósito, realizar a troca da bateria CMOS e reconfigurar a BIOS.","type":"servico","unitPrice":80,"price":80,"amount":80,"quantity":1},{"name":"Bateria Intelbras CR2032 CMOS P/Desktop Desposto.","description":"Bateria Intelbras CR2032 CMOS P/Desktop Desposto.","type":"produto","unitPrice":20,"price":20,"amount":20,"quantity":1}]	457	80.00	20.00	[{"name":"Visita técnica para verificar o desktop Dell do depósito, realizar a troca da bateria CMOS e reconfigurar a BIOS.","amount":80,"quantity":1,"type":"servico"}]	[{"name":"Bateria Intelbras CR2032 CMOS P/Desktop Desposto.","amount":20,"quantity":1,"type":"produto"}]	\N	\N	2025-11-25 03:18:14.710086	\N	0.00	9
510	Visita técnica para analisar estabilizador. .	124	307	entrada	1200.00	pago	\N	2025-11-24 16:46:04.14	2025-11-07 13:05:35.472	5	2025-11-24 16:46:05.393	9	\N	\N	\N	\N	Discriminação de valores:\n\nProdutos/Materiais:\n- Desktop DELL Optplex 3010, Corei3, 8gb RAM, SSD 128GB, Sistema e problemas instalados. : R$ 1000,00\n- Estabilizador Microssol 700va.: R$ 200,00\n\n[{"name":"Desktop DELL Optplex 3010, Corei3, 8gb RAM, SSD 128GB, Sistema e problemas instalados. ","description":"Desktop DELL Optplex 3010, Corei3, 8gb RAM, SSD 128GB, Sistema e problemas instalados. ","type":"produto","unitPrice":1000,"price":1000,"amount":1000,"quantity":1},{"name":"Estabilizador Microssol 700va.","description":"Estabilizador Microssol 700va.","type":"produto","unitPrice":200,"price":200,"amount":200,"quantity":1}]	338	0.00	1200.00	[]	[{"name":"Desktop DELL Optplex 3010, Corei3, 8gb RAM, SSD 128GB, Sistema e problemas instalados. ","amount":1000,"quantity":1,"type":"produto"},{"name":"Estabilizador Microssol 700va.","amount":200,"quantity":1,"type":"produto"}]	\N	\N	2025-11-07 13:10:36.249513	\N	0.00	1
1098	CPU do carrinho com problemas e impressora do balcão apresentando atolamento de papel	41	261	entrada	120.00	pendente	\N	\N	2025-11-24 20:21:17.248	1	2025-11-24 20:21:17.266486	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Reparo no rolete de alimentação pick UP roller: R$ 50,00\n- Limpeza interna e remoção de oxidação na memória CPU do carrinho: R$ 70,00\n\n[{"name":"Reparo no rolete de alimentação pick UP roller","description":"Reparo no rolete de alimentação pick UP roller","type":"servico","unitPrice":50,"price":50,"amount":50,"quantity":1},{"name":"Limpeza interna e remoção de oxidação na memória CPU do carrinho","description":"Limpeza interna e remoção de oxidação na memória CPU do carrinho","type":"servico","unitPrice":70,"price":70,"amount":70,"quantity":1}]	300	120.00	0.00	[{"name":"Reparo no rolete de alimentação pick UP roller","amount":50,"quantity":1,"type":"servico"},{"name":"Limpeza interna e remoção de oxidação na memória CPU do carrinho","amount":70,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-11-24 20:21:17.266486	\N	0.00	1
487	Telefones com problemas de conexão	40	314	entrada	100.00	pago	\N	2025-11-04 15:53:06.118	2025-10-30 20:03:51.339	1	2025-11-04 15:53:06.377	1	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Visita técnica para ajustes nos equipamentos de telefone e internet: R$ 100,00\n\n[{"name":"Visita técnica para ajustes nos equipamentos de telefone e internet","description":"Visita técnica para ajustes nos equipamentos de telefone e internet","type":"servico","unitPrice":100,"price":100,"amount":100,"quantity":1}]	318	100.00	0.00	[{"name":"Visita técnica para ajustes nos equipamentos de telefone e internet","amount":100,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-10-30 20:04:40.61571	\N	0.00	1
500	2 Impressoraw Epson L555, L5190 - Manutenção preventiva, limpeza interna, lubrificação, desentupimento da cabeça de impressão e tubulação, troca das almofadas e reset. 	127	325	entrada	250.00	pendente	\N	\N	2025-08-21 03:00:00	5	2025-11-05 03:04:37.847	\N	\N	\N	\N	\N		329	250.00	0.00	[{"name":"Impressora Epson L555 - manutenção preventiva, limpeza interna, lubrificação, desentupimento da cabeça de impressão e tubulação, troca das almofadas e reset. ","amount":250,"type":"servico"}]	[]	\N	\N	2025-10-31 15:56:56.089066	\N	0.00	1
1086	Verificar barulho máquina Alcimar.	131	\N	entrada	355.00	pago	\N	2025-11-28 12:58:06.081	2025-11-24 10:51:28.977	9	2025-11-28 12:58:07.326	9	\N	\N	\N	\N	Verificar barulho máquina Alcimar.\n\nDiscriminação de valores:\n\nServiços:\n- 4x Manutenção preventiva desktop - Limpeza interna, desoxidação das placas e troca da pasta térmica. (R$ 80,00 cada): R$ 320,00\n\nProdutos/Materiais:\n- Cooler 9mm Fonte ATX - P/ Desktop Alcimar.: R$ 35,00\n\n[{"name":"Manutenção preventiva desktop - Limpeza interna, desoxidação das placas e troca da pasta térmica.","amount":320,"quantity":4,"type":"servico"},{"name":"Cooler 9mm Fonte ATX - P/ Desktop Alcimar.","amount":35,"quantity":1,"type":"produto"}]	435	320.00	35.00	[{"name":"Manutenção preventiva desktop - Limpeza interna, desoxidação das placas e troca da pasta térmica.","amount":320,"quantity":4,"type":"servico"}]	[{"name":"Cooler 9mm Fonte ATX - P/ Desktop Alcimar.","amount":35,"quantity":1,"type":"produto"}]	\N	\N	2025-11-24 10:51:28.99667	\N	0.00	1
1091	Manutenção na cabeça de impressão	13	\N	entrada	150.00	pendente	\N	\N	2025-11-24 12:10:54.367	1	2025-11-24 12:10:54.387201	\N	\N	\N	\N	\N	Manutenção na cabeça de impressão\n\nDiscriminação de valores:\n\nServiços:\n- Manutenção na cabeça de impressão : R$ 150,00\n\n[{"name":"Manutenção na cabeça de impressão ","amount":150,"quantity":1,"type":"servico"}]	402	150.00	0.00	[{"name":"Manutenção na cabeça de impressão ","amount":150,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-11-24 12:10:54.387201	\N	0.00	1
1092	Manutenção impressora Epson	141	\N	entrada	180.00	pendente	\N	\N	2025-11-24 16:40:27.47	5	2025-11-24 16:40:27.488097	\N	\N	\N	\N	\N	Manutenção Impressora Epson - Limpeza Interna, lubrificação, troca do rolete tracionador de papel, troca das almofadas se reset.\n\nDiscriminação de valores:\n\nServiços:\n- Manutenção Impressora Epson - Limpeza Interna, lubrificação, troca do rolete tracionador de papel, troca das almofadas se reset.: R$ 150,00\n\nProdutos/Materiais:\n- Rolete Tracionador do Papel - Epson: R$ 30,00\n\n[{"name":"Manutenção Impressora Epson - Limpeza Interna, lubrificação, troca do rolete tracionador de papel, troca das almofadas se reset.","description":"Manutenção Impressora Epson - Limpeza Interna, lubrificação, troca do rolete tracionador de papel, troca das almofadas se reset.","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1},{"name":"Rolete Tracionador do Papel - Epson","description":"Rolete Tracionador do Papel - Epson","type":"produto","unitPrice":30,"price":30,"amount":30,"quantity":1}]	434	150.00	30.00	[{"name":"Manutenção Impressora Epson - Limpeza Interna, lubrificação, troca do rolete tracionador de papel, troca das almofadas se reset.","amount":150,"quantity":1,"type":"servico"}]	[{"name":"Rolete Tracionador do Papel - Epson","amount":30,"quantity":1,"type":"produto"}]	\N	\N	2025-11-24 16:40:27.488097	\N	0.00	1
216	Reposição de tela, teclado e DC Jack notebook Samsung\n\nDiscriminação de valores:\n\nServiços:\n- Mão de obra especializada para substituição de tela e testes nos componentes: R$ 150,00\n- Reposição DC Jack solda na placa: R$ 50,00\n\nProdutos/Materiais:\n- Tela 15,6" nova com garantia: R$ 350,00\n- Teclado notebook Samsung: R$ 120,00\n- CD Jack Samsung: R$ 30,00\n\n[{"name":"Mão de obra especializada para substituição de tela e testes nos componentes","amount":150,"type":"servico"},{"name":"Tela 15,6\\" nova com garantia","amount":350,"type":"produto"},{"name":"Teclado notebook Samsung","amount":120,"type":"produto"},{"name":"CD Jack Samsung","description":"CD Jack Samsung","type":"produto","price":30,"amount":30,"quantity":1},{"name":"Reposição DC Jack solda na placa","description":"Reposição DC Jack solda na placa","type":"servico","price":50,"amount":50,"quantity":1}]	78	\N	entrada	700.00	pago	\N	\N	2025-07-28 03:00:00	1	2025-09-08 13:53:41.113	1	\N	\N	\N	\N	\N	65	200.00	500.00	[{"name":"Mão de obra especializada para substituição de tela e testes nos componentes","amount":150,"type":"servico"},{"name":"Reposição DC Jack solda na placa","amount":50,"type":"servico"}]	[{"name":"Tela 15,6\\" nova com garantia","amount":350,"type":"produto"},{"name":"Teclado notebook Samsung","amount":120,"type":"produto"},{"name":"CD Jack Samsung","amount":30,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
516	Serviço de Manutenção impressora Epson L3250 - Consultório Dr. Dirceu. Limpeza interna, lubrificação, troca das almofadas do descarte e reset. Peça + Serviço.	101	341	entrada	150.00	pago	\N	2025-11-24 16:45:45.569	2025-11-11 03:00:00	5	2025-11-24 16:45:47.426	9	\N	\N	\N	\N	\N	345	150.00	0.00	[{"name":"Serviço de Manutenção impressora Epson L3250 - Consultório Dr. Dirceu. Limpeza interna, lubrificação, troca das almofadas do descarte e reset. Peça + Serviço.","amount":150,"type":"servico"}]	[]	\N	\N	2025-11-13 11:37:31.067986	\N	0.00	1
505	Manutenção Epson L395, limpeza interna e desentupimento da cabeça de impressão e tubulações de tinta. (Julane)	127	334	entrada	150.00	pendente	\N	\N	2025-08-20 03:00:00	5	2025-11-05 02:58:21.845	\N	\N	\N	\N	\N		333	150.00	0.00	[{"name":"Manutenção Epson L395, limpeza interna e desentupimento da cabeça de impressão e tubulações de tinta. ","amount":150,"type":"servico"}]	[]	\N	\N	2025-11-05 02:46:40.563422	\N	0.00	1
502	3 estabilizadora para reparo. Apenas um teve reparo. Reparo na placa com troca de componentes. 	127	327	entrada	120.00	pendente	\N	\N	2025-09-22 03:00:00	5	2025-11-05 03:11:25.102	\N	\N	\N	\N	\N		331	120.00	0.00	[{"name":"3 estabilizadora para reparo. Apenas um teve reparo. Reparo na placa com troca de componentes. ","amount":120,"type":"servico"}]	[]	\N	\N	2025-10-31 16:02:37.937027	\N	0.00	1
507	Impressora Epson L555. Diagnóstico e resolução. Correira o cara de impressão partida. Resolução. \nLimpeza interna e lubrificação, troca da correia do carro de impressão, manutenção cabeça de impressão. 	127	335	entrada	220.00	pendente	\N	\N	2025-10-23 03:00:00	5	2025-11-05 03:36:37.743034	\N	\N	\N	\N	\N	\N	334	220.00	0.00	[{"name":"Impressora Epson L555. Diagnóstico e resolução. Correira o cara de impressão partida. Resolução. \\nLimpeza interna e lubrificação, troca da correia do carro de impressão, manutenção cabeça de impressão. ","amount":220,"type":"servico"}]	[]	\N	\N	2025-11-05 03:36:37.743034	\N	0.00	1
508	Manutenção geral em impressora grande porte. Brother DCP L5502DN. Limpeza interna e lubrificação, manutenção na unidade de fusão, manutenção sistema do scaner e troca da lâmpada. Troca do toner e DR.	127	336	entrada	450.00	pendente	\N	\N	2025-10-23 03:00:00	5	2025-11-05 03:40:38.226	\N	\N	\N	\N	\N		335	450.00	0.00	[{"name":"Manutenção geral em impressora grande porte. Limpeza interna e lubrificação, manutenção na unidade de fusão, manutenção sistema do scaner e troca da lâmpada. Troca do toner e DR.","amount":450,"type":"servico"}]	[]	\N	\N	2025-11-05 03:38:56.35763	\N	0.00	1
511	Manutenção impressora Brother DCP-L5502DN SN: U64189G1N680228.  Manutenção Sistema cópia/scaner. Com troca do encoder. Troca do Toner e DR/Cilindro.	127	342	entrada	350.00	pendente	\N	\N	2025-11-11 17:42:21.253	5	2025-11-11 17:43:10.052621	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Manutenção impressora Brother DCP-L5502DN SN: U64189G1N680228.  Manutenção Sistema cópia/scaner. Com troca do encoder. Troca do Toner e DR/Cilindro.: R$ 350,00\n\n[{"name":"Manutenção impressora Brother DCP-L5502DN SN: U64189G1N680228.  Manutenção Sistema cópia/scaner. Com troca do encoder. Troca do Toner e DR/Cilindro.","description":"Manutenção impressora Brother DCP-L5502DN SN: U64189G1N680228.  Manutenção Sistema cópia/scaner. Com troca do encoder. Troca do Toner e DR/Cilindro.","type":"servico","unitPrice":350,"price":350,"amount":350,"quantity":1}]	340	350.00	0.00	[{"name":"Manutenção impressora Brother DCP-L5502DN SN: U64189G1N680228.  Manutenção Sistema cópia/scaner. Com troca do encoder. Troca do Toner e DR/Cilindro.","amount":350,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-11-11 17:43:10.052621	\N	0.00	1
515	Serviço reparo impressora HP LaserJet P1102w recepção. Troca do rolete do tracionador do papel. Serviço + peça. 	101	350	entrada	150.00	pendente	\N	\N	2025-10-31 03:00:00	5	2025-11-13 11:35:50.712971	\N	\N	\N	\N	\N	\N	347	150.00	0.00	[{"name":"Serviço reparo impressora HP LaserJet P1102w recepção. Troca do rolete do tracionador do papel. Serviço + peça. ","amount":150,"type":"servico"}]	[]	\N	\N	2025-11-13 11:35:50.712971	\N	0.00	1
1187	sadsadasdasdasdas	64	219	entrada	100.00	pendente	\N	\N	2025-11-30 02:01:30.539	1	2025-11-30 02:01:30.556998	\N	\N	\N	\N	\N	\N	511	100.00	0.00	[{"name":"sadsadasdasdasdas","amount":100,"type":"servico"}]	[]	\N	\N	2025-11-30 02:01:30.556998	\N	0.00	1
118	Acesso remoto a máquina dos farmacêuticos João da Escóssia para ajustar acesso do BI. Restaurar navegador e reconfigurar. Resolvido.	28	\N	entrada	100.00	pago	\N	2025-07-31 11:45:22.738	2025-07-30 11:01:51.18	5	2025-07-31 11:45:23.32	9	\N	\N	\N	\N	\N	128	100.00	0.00	[{"name":"Acesso remoto a máquina dos farmacêuticos João da Escóssia para ajustar acesso do BI. Restaurar navegador e reconfigurar. Resolvido.","amount":100,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
116	Visita técnica para desinstalar desktop do controle de qualidade e instalar no laboratório farmacêutico, com instalação de impressora térmica nova e compartilhamento na rede para mapear em algumas máquinas do laboratório.	28	\N	entrada	150.00	pago	\N	2025-08-03 11:57:16.081	2025-06-21 03:00:00	5	2025-08-03 11:57:16.55	9	\N	\N	\N	\N	\N	125	150.00	0.00	[{"name":"Visita técnica para desinstalar desktop do controle de qualidade e instalar no laboratório farmacêutico, com instalação de impressora térmica nova e compartilhamento na rede para mapear em algumas máquinas do laboratório.","amount":150,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
266	Parcela 1 - Kit Dell: Desktop Dell Optplex 3010.\nProcessador Corei3. 8gb de memoria RAM. SSD 128GB.\nMonitor DELL 19 Polegadas.\nMouse e teclado Dell com Fio.	71	\N	entrada	380.00	pago	\N	2025-08-26 15:29:22.642	2025-08-26 15:29:22.642	5	2025-08-26 15:29:22.661562	9	\N	27	1	4	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-26 15:29:22.661562	\N	0.00	1
428	Problema maquina consultório. 	101	\N	entrada	120.00	pendente	\N	\N	2025-10-02 03:00:00	5	2025-11-13 11:40:20.393	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Visita técnica para ajustes no notebook do consultório Dr. Dirceu. Conversão de documentos Word para PDF para assinatura digital e configuração do certificado digital na máquina para uso em plataforma online.: R$ 120,00\n\n[{"name":"Visita técnica para ajustes no notebook do consultório Dr. Dirceu. Conversão de documentos Word para PDF para assinatura digital e configuração do certificado digital na máquina para uso em plataforma online.","description":"Visita técnica para ajustes no notebook do consultório Dr. Dirceu. Conversão de documentos Word para PDF para assinatura digital e configuração do certificado digital na máquina para uso em plataforma online.","type":"servico","unitPrice":120,"price":120,"amount":120,"quantity":1}]	273	120.00	0.00	[{"name":"Visita técnica para ajustes no notebook do consultório Dr. Dirceu. Conversão de documentos Word para PDF para assinatura digital e configuração do certificado digital na máquina para uso em plataforma online.","amount":120,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-10-06 14:15:08.552515	\N	0.00	1
474	Verificar etiquetadora zebra do lab Rafaela. 	8	283	entrada	100.00	pendente	\N	\N	2025-10-17 03:00:00	5	2025-11-13 14:21:22.823	\N	\N	\N	\N	\N	Discriminação de valores:\n\nProdutos/Materiais:\n- Visita técnica com reinstalação da impressora zebra e testes no sistema de impressão do Álvaro : R$ 100,00\n\n[{"name":"Visita técnica com reinstalação da impressora zebra e testes no sistema de impressão do Álvaro ","description":"Visita técnica com reinstalação da impressora zebra e testes no sistema de impressão do Álvaro ","type":"produto","unitPrice":100,"price":100,"amount":100,"quantity":1}]	298	0.00	100.00	[]	[{"name":"Visita técnica com reinstalação da impressora zebra e testes no sistema de impressão do Álvaro ","amount":100,"quantity":1,"type":"produto"}]	\N	\N	2025-10-22 04:27:02.59419	\N	0.00	1
469	Visita técnica para ajustes no raio x, recepção e impressora Dra Isabelli 	8	288	entrada	100.00	pendente	\N	\N	2025-10-21 03:00:00	5	2025-11-13 14:21:35.027	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Continuação suporte raio X: R$ 0,00\n- Ajustes no Pc da recepção que foi trocado pelo Pc da sala do eletro: R$ 0,00\n- Reinstalação impressora sala Dra Isabelli : R$ 100,00\n\n[{"name":"Continuação suporte raio X","description":"Continuação suporte raio X","type":"servico","unitPrice":0,"price":0,"amount":0,"quantity":1},{"name":"Ajustes no Pc da recepção que foi trocado pelo Pc da sala do eletro","description":"Ajustes no Pc da recepção que foi trocado pelo Pc da sala do eletro","type":"servico","unitPrice":0,"price":0,"amount":0,"quantity":1},{"name":"Reinstalação impressora sala Dra Isabelli ","description":"Reinstalação impressora sala Dra Isabelli ","type":"servico","unitPrice":100,"price":100,"amount":100,"quantity":1}]	296	100.00	0.00	[{"name":"Continuação suporte raio X","amount":0,"quantity":1,"type":"servico"},{"name":"Ajustes no Pc da recepção que foi trocado pelo Pc da sala do eletro","amount":0,"quantity":1,"type":"servico"},{"name":"Reinstalação impressora sala Dra Isabelli ","amount":100,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-10-21 17:30:56.971229	\N	0.00	1
472	Ligar máquina no teleatendimento e trazer um estabilizador para reparo	8	289	entrada	100.00	pendente	\N	\N	2025-10-24 03:00:00	5	2025-11-13 14:21:45.435	\N	\N	\N	\N	\N		304	100.00	0.00	[{"name":"Ligar máquina no teleatendimento e trazer um estabilizador para reparo","amount":100,"type":"servico"}]	[]	\N	\N	2025-10-22 04:25:54.094022	\N	0.00	1
517	Computador da sala 4 está muito lento. Ver a possibilidade de upgrade ou substituição da máquina. Coringa Avançado ajustado para o consultório.  Formatação e reinstalação do sistema operacional.	8	293	entrada	150.00	pendente	\N	\N	2025-10-31 03:00:00	1	2025-11-13 14:24:24.752678	\N	\N	\N	\N	\N	\N	349	150.00	0.00	[{"name":"Computador da sala 4 está muito lento. Ver a possibilidade de upgrade ou substituição da máquina. Coringa Avançado ajustado para o consultório.  Formatação e reinstalação do sistema operacional.","amount":150,"type":"servico"}]	[]	\N	\N	2025-11-13 14:24:24.752678	\N	0.00	1
1006	Impressora de fotos imprime até metade	30	\N	entrada	80.00	pago	\N	2025-11-26 15:47:57.275	2025-07-30 03:00:00	1	2025-11-26 15:47:56.744	1	\N	\N	\N	\N	Provavelmente a engrenagem que eu fiz reparo deu problema. Máquina na assistência para análise.\n\nDiscriminação de valores:\n\nServiços:\n- Reparo em componentes e engrenagens : R$ 180,00\n\n[{"name":"Reparo em componentes e engrenagens ","description":"Reparo em componentes e engrenagens ","type":"servico","unitPrice":180,"price":180,"amount":180,"quantity":1}]\n\n--- DESCONTO APLICADO ---\nValor original: R$ 180,00\nDesconto: R$ 100,00\nValor final: R$ 80,00	133	180.00	0.00	[{"name":"Reparo em componentes e engrenagens ","amount":180,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-11-22 16:35:47.095503	180.00	100.00	1
115	2 Visitas técnicas para diagnosticar e resolver problema em um dos Desktops da Pedro Velho. Problema no teclado. Pegar um teclado na caixa da Informática em loja João da Escóssia. 	28	\N	entrada	100.00	pago	\N	2025-08-03 11:56:58.117	2025-06-11 03:00:00	5	2025-08-03 11:56:58.798	9	\N	\N	\N	\N	\N	124	100.00	0.00	[{"name":"2 Visitas técnicas para diagnosticar e resolver problema em um dos Desktops da Pedro Velho. Problema no teclado. Pegar um teclado na caixa da Informática em loja João da Escóssia. ","amount":100,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
1268	Note Kew tá com Claudinho pra adapta botão. 	24	253	entrada	350.00	pendente	\N	\N	2026-01-14 15:49:13.535	9	2026-01-14 15:49:13.552933	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Notebook - Diagnóstico e resolução. Reparo na placa mãe e adaptação do botão Power.: R$ 350,00\n\n[{"name":"Notebook - Diagnóstico e resolução. Reparo na placa mãe e adaptação do botão Power.","description":"Notebook - Diagnóstico e resolução. Reparo na placa mãe e adaptação do botão Power.","type":"servico","unitPrice":350,"price":350,"amount":350,"quantity":1}]	558	350.00	0.00	[{"name":"Notebook - Diagnóstico e resolução. Reparo na placa mãe e adaptação do botão Power.","amount":350,"quantity":1,"type":"servico"}]	[]	\N	\N	2026-01-14 15:49:13.552933	\N	0.00	9
117	Diagnóstico e resolução. Troca das fontes do DVR e Câmeras. Serviço + peças.\n\nDiscriminação de valores:\n\nServiços:\n- Diagnóstico e resolução. Troca da fonte do DVR e Câmeras, ajuste nas posições.: R$ 200,00\n\nProdutos/Materiais:\n- Fonte Bivolt Conector P4 DVR. : R$ 70,00\n- Fonte 12v Chaveada p/ Câmeras.: R$ 50,00\n\n[{"name":"Diagnóstico e resolução. Troca da fonte do DVR e Câmeras, ajuste nas posições.","amount":200,"type":"servico"},{"name":"Fonte Bivolt Conector P4 DVR. ","amount":70,"type":"produto"},{"name":"Fonte 12v Chaveada p/ Câmeras.","amount":50,"type":"produto"}]	28	\N	entrada	320.00	pago	\N	2025-07-31 11:44:08.134	2025-07-07 03:00:00	5	2025-07-31 11:44:08.889	9	\N	\N	\N	\N	Diagnóstico e resolução. Troca da fonte do DVR ...	126	200.00	120.00	[{"name":"Diagnóstico e resolução. Troca da fonte do DVR e Câmeras, ajuste nas posições.","amount":200,"type":"servico"}]	[{"name":"Fonte Bivolt Conector P4 DVR. ","amount":70,"type":"produto"},{"name":"Fonte 12v Chaveada p/ Câmeras.","amount":50,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
121	Manutenção Epson M2170. Limpeza interna, troca das almofadas do descarte e reset com substituição do chip da caixa de manutenção.\n\nDiscriminação de valores:\n\nServiços:\n- Manutenção Epson M2170. Limpeza interna, troca das almofadas do descarte e reset com substituição do chip da caixa de manutenção.: R$ 150,00\n\nProdutos/Materiais:\n- Chip Caixa manutenção Epson M2170 + Frete.: R$ 50,00\n\n[{"name":"Manutenção Epson M2170. Limpeza interna, troca das almofadas do descarte e reset com substituição do chip da caixa de manutenção.","description":"Manutenção Epson M2170. Limpeza interna, troca das almofadas do descarte e reset com substituição do chip da caixa de manutenção.","type":"servico","price":150,"amount":150,"quantity":1},{"name":"Chip Caixa manutenção Epson M2170 + Frete.","description":"Chip Caixa manutenção Epson M2170 + Frete.","type":"produto","price":50,"amount":50,"quantity":1}]	84	\N	entrada	190.00	pago	\N	2025-08-03 11:56:15.067	2025-07-30 03:00:00	5	2025-08-03 11:56:17.74	9	\N	\N	\N	\N		131	150.00	50.00	[{"name":"Manutenção Epson M2170. Limpeza interna, troca das almofadas do descarte e reset com substituição do chip da caixa de manutenção.","amount":150,"type":"servico"}]	[{"name":"Chip Caixa manutenção Epson M2170 + Frete.","amount":50,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
537	Substituição do roteador	22	264	entrada	505.00	pendente	\N	\N	2025-10-21 10:49:16.716	1	2025-11-22 03:59:08.645729	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Formatação servidor de backup : R$ 150,00\n- Visita técnica para configurar novo roteador na rede: R$ 80,00\n\nProdutos/Materiais:\n- Roteador Intelbras w6 : R$ 275,00\n\n[{"name":"Formatação servidor de backup ","description":"Formatação servidor de backup ","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1},{"name":"Roteador Intelbras w6 ","description":"Roteador Intelbras w6 ","type":"produto","unitPrice":275,"price":275,"amount":275,"quantity":1},{"name":"Visita técnica para configurar novo roteador na rede","description":"Visita técnica para configurar novo roteador na rede","type":"servico","unitPrice":80,"price":80,"amount":80,"quantity":1}]	299	230.00	275.00	[{"name":"Formatação servidor de backup ","amount":150,"quantity":1,"type":"servico"},{"name":"Visita técnica para configurar novo roteador na rede","amount":80,"quantity":1,"type":"servico"}]	[{"name":"Roteador Intelbras w6 ","amount":275,"quantity":1,"type":"produto"}]	\N	\N	2025-11-22 03:59:08.645729	\N	0.00	1
122	Substituição do HD defeituoso por SSD 256GB. Backup, formatação,.instalação e atualização do sistema e programas. \n\nDiscriminação de valores:\n\nServiços:\n- Substituição do HD defeituoso por SSD 256GB. Backup, formatação,.instalação e atualização do sistema e programas. : R$ 150,00\n\nProdutos/Materiais:\n- SSD KingSpec 256gb.: R$ 210,00\n\n[{"name":"Substituição do HD defeituoso por SSD 256GB. Backup, formatação,.instalação e atualização do sistema e programas. ","description":"Substituição do HD defeituoso por SSD 256GB. Backup, formatação,.instalação e atualização do sistema e programas. ","type":"servico","price":150,"amount":150,"quantity":1},{"name":"SSD KingSpec 256gb.","description":"SSD KingSpec 256gb.","type":"produto","price":210,"amount":210,"quantity":1}]	85	\N	entrada	350.00	pago	\N	2025-08-21 19:05:23.854	2025-07-30 03:00:00	5	2025-08-21 19:05:24.439	9	\N	\N	\N	\N		132	150.00	210.00	[{"name":"Substituição do HD defeituoso por SSD 256GB. Backup, formatação,.instalação e atualização do sistema e programas. ","amount":150,"type":"servico"}]	[{"name":"SSD KingSpec 256gb.","amount":210,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
372	Parcela 1 - Dellzao + Monitor para Assis Carlos contador ABL3	64	\N	entrada	900.00	pago	\N	2025-09-11 15:56:35.612	2025-09-11 15:56:35.612	5	2025-09-11 15:56:35.630713	9	\N	371	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-11 15:56:35.630713	\N	0.00	1
1166	Monitor Dell 19" Jacinta	14	185	entrada	450.00	pendente	\N	\N	2025-11-26 19:09:53.278	1	2025-11-26 19:09:53.296617	\N	\N	\N	\N	\N	Discriminação de valores:\n\nProdutos/Materiais:\n- Monitor Dell 19" widescreen: R$ 450,00\n\n[{"name":"Monitor Dell 19\\" widescreen","description":"Monitor Dell 19\\" widescreen","type":"produto","unitPrice":450,"price":450,"amount":450,"quantity":1}]	481	0.00	450.00	[]	[{"name":"Monitor Dell 19\\" widescreen","amount":450,"quantity":1,"type":"produto"}]	\N	\N	2025-11-26 19:09:53.296617	\N	0.00	1
1015	Manutenção impressora Recepção	58	\N	entrada	180.00	pendente	\N	\N	2025-11-22 21:10:27.618	5	2025-11-22 21:11:31.528767	\N	\N	\N	\N	\N	Manutenção impressora Recepção\n\nDiscriminação de valores:\n\nServiços:\n- Manutenção Impressora Epson L355 -Limpeza interna e lubrificação, troca das almofadas do descarte e tracionador de papel. Reset do sistema.: R$ 150,00\n\nProdutos/Materiais:\n- Rolete Tracionador de Papel - Epson L555: R$ 30,00\n\n[{"name":"Manutenção Impressora Epson L355 -Limpeza interna e lubrificação, troca das almofadas do descarte e tracionador de papel. Reset do sistema.","description":"Manutenção Impressora Epson L355 -Limpeza interna e lubrificação, troca das almofadas do descarte e tracionador de papel. Reset do sistema.","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1},{"name":"Rolete Tracionador de Papel - Epson L555","amount":30,"quantity":1,"type":"produto"}]	407	150.00	30.00	[{"name":"Manutenção Impressora Epson L355 -Limpeza interna e lubrificação, troca das almofadas do descarte e tracionador de papel. Reset do sistema.","amount":150,"quantity":1,"type":"servico"}]	[{"name":"Rolete Tracionador de Papel - Epson L555","amount":30,"quantity":1,"type":"produto"}]	\N	\N	2025-11-22 21:11:31.528767	\N	0.00	1
379	Visita técnica para instalar impressora na rede e mapear no computador do consultório. 	101	\N	entrada	100.00	pago	\N	2025-09-18 19:13:01.572	2025-09-12 14:32:27.959	5	2025-09-18 19:13:04.588	9	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Visita técnica para instalar impressora na rede WIFI e mapear no IPAD. ( Impressora necessita trocar cartucho preto ): R$ 100,00\n\n[{"name":"Visita técnica para instalar impressora na rede WIFI e mapear no IPAD. ( Impressora necessita trocar cartucho preto )","description":"Visita técnica para instalar impressora na rede WIFI e mapear no IPAD. ( Impressora necessita trocar cartucho preto )","type":"servico","unitPrice":100,"price":100,"amount":100,"quantity":1}]	240	100.00	0.00	[{"name":"Visita técnica para instalar impressora na rede WIFI e mapear no IPAD. ( Impressora necessita trocar cartucho preto )","amount":100,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-09-12 14:33:42.788201	\N	0.00	1
188	Parcela 1/4 - Resolução de falha no sistema de Raio-X, com dois dias de trabalho dedicados à identificação e correção do problema. Foi realizado reparo no desktop do setor, onde, após extensa análise, foram detectadas falhas na placa-mãe e na fonte. As peças foram encaminhadas a parceiro especializado em reparo eletrônico.Após o conserto, foi necessário compreender e reconfigurar o funcionamento completo do sistema para restabelecer sua operação. Sistema restaurado, parametrizado e cópia de segurança criada para futuras eventualidades.	8	\N	entrada	250.00	pago	2025-06-10 03:00:00	2025-08-03 12:57:40.443	2025-06-10 03:00:00	5	2025-08-03 12:57:41.304	9	\N	187	1	4	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
193	Parcela 1/4 - Elaboração de contrato comercial de prestação de serviços e desenvolvimento de inventário completo da clínica, com especificações detalhadas de todos os equipamentos.\n\nDiscriminação de valores:\n\nServiços:\n- Elaboração de contrato comercial de prestação d...: R$ 600,00\n\n[{"name":"Elaboração de contrato comercial de prestação d...","amount":600,"type":"servico"}]	8	\N	entrada	150.00	pago	2025-06-10 03:00:00	2025-08-03 12:58:23.651	2025-06-10 03:00:00	5	2025-08-03 12:58:24.127	9	\N	192	1	4	\N	146	600.00	0.00	[{"name":"Elaboração de contrato comercial de prestação d...","amount":600,"type":"servico"}]	[]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	1
243	Visita técnica para instalar impressora. \n\nDiscriminação de valores:\n\nServiços:\n- Acesso remoto para instalar impressora Epson na rede e mapear em dois PC.: R$ 80,00\n\n[{"name":"Acesso remoto para instalar impressora Epson na rede e mapear em dois PC.","description":"Acesso remoto para instalar impressora Epson na rede e mapear em dois PC.","type":"servico","price":80,"amount":80,"quantity":1}]	91	\N	entrada	80.00	pago	\N	2025-08-21 19:05:59.153	2025-08-18 20:24:34.209	5	2025-08-21 19:05:59.859	9	\N	\N	\N	\N	\N	183	80.00	0.00	[{"name":"Acesso remoto para instalar impressora Epson na rede e mapear em dois PC.","amount":80,"type":"servico"}]	[]	\N	\N	2025-08-18 20:43:30.869386	\N	0.00	1
1170	2x seriais windows 10 pro	\N	\N	saida	70.00	pago	\N	2025-11-27 15:37:51.788	2025-11-27 15:37:38.489	1	2025-11-27 15:37:51.429	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-27 15:37:38.643883	\N	0.00	1
1141	Notebook para fazer manutenção.	135	359	entrada	350.00	pago	\N	2025-11-25 03:01:05.06	2025-11-25 03:00:08.738	9	2025-11-25 03:01:05.318	9	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Serviço de manutenção notebook. Limpeza interna, desoxidação das placas e troca da pasta térmica. Substituição do SSD.  Backup, formatação, atualização e configuração do sistema operacional e programas. : R$ 170,00\n\nProdutos/Materiais:\n- SSD SATA  KingSpec 256gb. ( 1 ANO GARANTIA ): R$ 220,00\n\n[{"name":"Serviço de manutenção notebook. Limpeza interna, desoxidação das placas e troca da pasta térmica. Substituição do SSD.  Backup, formatação, atualização e configuração do sistema operacional e programas. ","description":"Serviço de manutenção notebook. Limpeza interna, desoxidação das placas e troca da pasta térmica. Substituição do SSD.  Backup, formatação, atualização e configuração do sistema operacional e programas. ","type":"servico","unitPrice":170,"price":170,"amount":170,"quantity":1},{"name":"SSD SATA  KingSpec 256gb. ( 1 ANO GARANTIA )","description":"SSD SATA  KingSpec 256gb. ( 1 ANO GARANTIA )","type":"produto","unitPrice":220,"price":220,"amount":220,"quantity":1}]\n\n--- DESCONTO APLICADO ---\nValor original: R$ 390,00\nDesconto: R$ 40,00\nValor final: R$ 350,00	357	170.00	220.00	[{"name":"Serviço de manutenção notebook. Limpeza interna, desoxidação das placas e troca da pasta térmica. Substituição do SSD.  Backup, formatação, atualização e configuração do sistema operacional e programas. ","amount":170,"quantity":1,"type":"servico"}]	[{"name":"SSD SATA  KingSpec 256gb. ( 1 ANO GARANTIA )","amount":220,"quantity":1,"type":"produto"}]	\N	\N	2025-11-25 03:00:08.75675	390.00	40.00	1
1169	Ativação Windows 10	60	206	entrada	250.00	pago	\N	2025-11-27 15:31:26.227	2025-11-27 15:30:47.731	1	2025-11-27 15:31:25.731	1	\N	\N	\N	\N	Discriminação de valores:\n\nProdutos/Materiais:\n- 2x Serial Windows 10 pro  (R$ 125,00 cada): R$ 250,00\n\n[{"name":"Serial Windows 10 pro ","description":"Serial Windows 10 pro ","type":"produto","unitPrice":125,"price":250,"amount":250,"quantity":2}]	485	0.00	250.00	[]	[{"name":"Serial Windows 10 pro ","amount":250,"quantity":2,"type":"produto"}]	\N	\N	2025-11-27 15:30:47.750005	\N	0.00	1
1165	Pegar impressora Epson para fazer manutenção.	140	145	entrada	150.00	pago	\N	2025-11-28 12:57:07.177	2025-11-26 18:37:52.503	9	2025-11-28 12:57:08.379	9	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Manutenção impressora Epson L3250 - Limpeza interna e externa, lubrificação, desentupimento das tubulações e cabeça de impressão, troca da almofada do descarte e reset. : R$ 150,00\n\n[{"name":"Manutenção impressora Epson L3250 - Limpeza interna e externa, lubrificação, desentupimento das tubulações e cabeça de impressão, troca da almofada do descarte e reset. ","description":"Manutenção impressora Epson L3250 - Limpeza interna e externa, lubrificação, desentupimento das tubulações e cabeça de impressão, troca da almofada do descarte e reset. ","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1}]	459	150.00	0.00	[{"name":"Manutenção impressora Epson L3250 - Limpeza interna e externa, lubrificação, desentupimento das tubulações e cabeça de impressão, troca da almofada do descarte e reset. ","amount":150,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-11-26 18:37:52.521341	\N	0.00	1
1097	CPU Dell 3010 8gb RAM SSD 128gb + HD 320gb	26	\N	entrada	900.00	pago	\N	2025-12-02 20:31:54.17	2025-11-24 20:20:15.191	1	2025-12-02 20:31:54.392	1	\N	\N	\N	\N	CPU Dell 3010 8gb RAM SSD 128gb + HD 320gb\n\nDiscriminação de valores:\n\nServiços:\n- CPU Dell 3010 12gb RAM SSD 128gb + HD 320gb: R$ 1000,00\n\n[{"name":"CPU Dell 3010 12gb RAM SSD 128gb + HD 320gb","description":"CPU Dell 3010 12gb RAM SSD 128gb + HD 320gb","type":"servico","unitPrice":1000,"price":1000,"amount":1000,"quantity":1}]\n\n--- DESCONTO APLICADO ---\nValor original: R$ 1000,00\nDesconto: R$ 100,00\nValor final: R$ 900,00	433	1000.00	0.00	[{"name":"CPU Dell 3010 12gb RAM SSD 128gb + HD 320gb","amount":1000,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-11-24 20:20:15.209636	1000.00	100.00	1
1171	Instalação do sistema operacional máquina nova.	150	200	entrada	190.00	pago	\N	2025-11-28 12:56:49.082	2025-11-27 21:08:57.757	1	2025-11-29 10:48:47.636	9	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Instalação windows 11 + pacote de programas e atualizações: R$ 150,00\n\nProdutos/Materiais:\n- 15x Cabo de rede Rj45 100% cobre (R$ 3,00 cada): R$ 45,00\n\n[{"name":"Instalação windows 11 + pacote de programas e atualizações","description":"Instalação windows 11 + pacote de programas e atualizações","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1},{"name":"Cabo de rede Rj45 100% cobre","description":"Cabo de rede Rj45 100% cobre","type":"produto","unitPrice":3,"price":45,"amount":45,"quantity":15}]\n\n--- DESCONTO APLICADO ---\nValor original: R$ 195,00\nDesconto: R$ 5,00\nValor final: R$ 190,00	483	150.00	45.00	[{"name":"Instalação windows 11 + pacote de programas e atualizações","amount":150,"quantity":1,"type":"servico"}]	[{"name":"Cabo de rede Rj45 100% cobre","amount":45,"quantity":15,"type":"produto"}]	\N	\N	2025-11-27 21:08:57.775904	195.00	5.00	9
1142	Desktop Dell Depósito Reiniciando.	67	\N	entrada	1.00	pendente	\N	\N	2025-11-25 03:11:56.67	9	2025-11-25 03:13:11.003	\N	\N	\N	\N	\N	Desktop Dell Depósito Reiniciando.\n\nDiscriminação de valores:\n\nServiços:\n- Visita técnica para verificar e corrigir o sistema operacional do desktop do depósito, incluindo configuração das opções de suspensão e hibernação. (CORTESIA): R$ 1,00\n\n[{"name":"Visita técnica para verificar e corrigir o sistema operacional do desktop do depósito, incluindo configuração das opções de suspensão e hibernação. (CORTESIA)","description":"Visita técnica para verificar e corrigir o sistema operacional do desktop do depósito, incluindo configuração das opções de suspensão e hibernação. (CORTESIA)","type":"servico","unitPrice":1,"price":1,"amount":1,"quantity":1}]	456	1.00	0.00	[{"name":"Visita técnica para verificar e corrigir o sistema operacional do desktop do depósito, incluindo configuração das opções de suspensão e hibernação. (CORTESIA)","amount":1,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-11-25 03:11:56.6877	\N	0.00	1
1144	Internet portão de eventos	56	107	entrada	100.00	pendente	\N	\N	2025-11-25 03:26:22.141	9	2025-11-25 03:26:22.160793	\N	\N	\N	\N	\N	Visita técnica para verificar internet do portão de eventos. Roteador desligado devido a serviço na área da bomba dagua.\n\nDiscriminação de valores:\n\nServiços:\n- Visita técnica para verificar internet do portão de eventos. Roteador desligado devido a serviço na área da bomba dagua.: R$ 100,00\n\n[{"name":"Visita técnica para verificar internet do portão de eventos. Roteador desligado devido a serviço na área da bomba dagua.","description":"Visita técnica para verificar internet do portão de eventos. Roteador desligado devido a serviço na área da bomba dagua.","type":"servico","unitPrice":100,"price":100,"amount":100,"quantity":1}]	460	100.00	0.00	[{"name":"Visita técnica para verificar internet do portão de eventos. Roteador desligado devido a serviço na área da bomba dagua.","amount":100,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-11-25 03:26:22.160793	\N	0.00	1
1177	Upgrade notebooks	143	\N	entrada	900.00	pendente	\N	\N	2025-11-28 20:30:26.201	1	2025-11-29 10:47:31.948	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- 2x Backup, formatação, reinstalação, atualização e configuração do sistema operacional e programas. Limpeza interna, desoxidação das placas e troca da pasta térmica.  (R$ 150,00 cada): R$ 300,00\n\nProdutos/Materiais:\n- 2x Memória  Hiker 8gb DDR 2660GHz. P/Notebook. (R$ 300,00 cada): R$ 600,00\n\n[{"name":"Backup, formatação, reinstalação, atualização e configuração do sistema operacional e programas. Limpeza interna, desoxidação das placas e troca da pasta térmica. ","amount":300,"quantity":2,"type":"servico"},{"name":"Memória  Hiker 8gb DDR 2660GHz. P/Notebook.","amount":600,"quantity":2,"type":"produto"}]	493	300.00	600.00	[{"name":"Backup, formatação, reinstalação, atualização e configuração do sistema operacional e programas. Limpeza interna, desoxidação das placas e troca da pasta térmica. ","amount":300,"quantity":2,"type":"servico"}]	[{"name":"Memória  Hiker 8gb DDR 2660GHz. P/Notebook.","amount":600,"quantity":2,"type":"produto"}]	\N	\N	2025-11-28 20:30:26.21971	\N	0.00	9
1188	Fonte ATX queimada	26	221	entrada	180.00	pago	\N	2025-12-02 20:31:36.763	2025-12-02 17:36:18.837	1	2025-12-02 20:31:37.291	1	\N	\N	\N	\N	Discriminação de valores:\n\nProdutos/Materiais:\n- Fonte ATX 12v 250w: R$ 120,00\n- Visita técnica para ajustes na CPU recepção com troca de fonte: R$ 80,00\n\n[{"name":"Fonte ATX 12v 250w","description":"Fonte ATX 12v 250w","type":"produto","unitPrice":120,"price":120,"amount":120,"quantity":1},{"name":"Visita técnica para ajustes na CPU recepção com troca de fonte","description":"Visita técnica para ajustes na CPU recepção com troca de fonte","type":"produto","unitPrice":80,"price":80,"amount":80,"quantity":1}]\n\n--- DESCONTO APLICADO ---\nValor original: R$ 200,00\nDesconto: R$ 20,00\nValor final: R$ 180,00	516	0.00	200.00	[]	[{"name":"Fonte ATX 12v 250w","amount":120,"quantity":1,"type":"produto"},{"name":"Visita técnica para ajustes na CPU recepção com troca de fonte","amount":80,"quantity":1,"type":"produto"}]	\N	\N	2025-12-02 17:36:18.856859	200.00	20.00	1
1096	Reparo no no-break do alarme e internet	26	\N	entrada	342.00	pago	\N	2025-12-02 20:31:44.827	2025-11-24 20:19:38.691	1	2025-12-02 20:31:45.054	1	\N	\N	\N	\N	Reparo no no-break do alarme e internet\n\nDiscriminação de valores:\n\nServiços:\n- Visita técnica para configuração do sistema de back-ups do software Doctors: R$ 150,00\n- Manutenção do no-break do sistema de alarmes e internet: R$ 100,00\n\nProdutos/Materiais:\n- Bateria 12v 7ah no-break Intelbras: R$ 130,00\n\n[{"name":"Visita técnica para configuração do sistema de back-ups do software Doctors","amount":150,"quantity":1,"type":"servico"},{"name":"Manutenção do no-break do sistema de alarmes e internet","amount":100,"quantity":1,"type":"servico"},{"name":"Bateria 12v 7ah no-break Intelbras","amount":130,"quantity":1,"type":"produto"}]\n\n--- DESCONTO APLICADO ---\nValor original: R$ 380,00\nDesconto: R$ 38,00\nValor final: R$ 342,00	403	250.00	130.00	[{"name":"Visita técnica para configuração do sistema de back-ups do software Doctors","amount":150,"quantity":1,"type":"servico"},{"name":"Manutenção do no-break do sistema de alarmes e internet","amount":100,"quantity":1,"type":"servico"}]	[{"name":"Bateria 12v 7ah no-break Intelbras","amount":130,"quantity":1,"type":"produto"}]	\N	\N	2025-11-24 20:19:38.708801	380.00	38.00	1
1189	7x fontes ATX mercado livre	\N	\N	saida	325.00	pago	\N	2025-12-03 07:01:12.004	2025-12-03 07:00:54.915	1	2025-12-03 07:01:12.265	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-03 07:00:55.214863	\N	0.00	1
1190	Ativação pacote office recepção.	56	\N	entrada	80.00	pendente	\N	\N	2025-12-03 12:18:42.049	9	2025-12-03 12:18:42.067653	\N	\N	\N	\N	\N	Ativação pacote office recepção.\n\nDiscriminação de valores:\n\nServiços:\n- Acesso remoto para reinstalar e ativar pacote office no Pc da recepção.: R$ 80,00\n\n[{"name":"Acesso remoto para reinstalar e ativar pacote office no Pc da recepção.","description":"Acesso remoto para reinstalar e ativar pacote office no Pc da recepção.","type":"servico","unitPrice":80,"price":80,"amount":80,"quantity":1}]	517	80.00	0.00	[{"name":"Acesso remoto para reinstalar e ativar pacote office no Pc da recepção.","amount":80,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-12-03 12:18:42.067653	\N	0.00	9
1191	Acesso remoto para configurar impressora.	153	226	entrada	50.00	pago	\N	2025-12-13 02:22:10.151	2025-12-03 12:19:36.926	9	2025-12-13 02:22:10.641	9	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Acesso remoto para instalar e mapear impressora.: R$ 50,00\n\n[{"name":"Acesso remoto para instalar e mapear impressora.","description":"Acesso remoto para instalar e mapear impressora.","type":"servico","unitPrice":50,"price":50,"amount":50,"quantity":1}]	515	50.00	0.00	[{"name":"Acesso remoto para instalar e mapear impressora.","amount":50,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-12-03 12:19:36.942994	\N	0.00	9
1194	Desktop Adryelle com barulho. Fazer limpeza. 	56	176	entrada	100.00	pendente	\N	\N	2025-12-03 12:24:22.89	9	2025-12-03 12:24:22.906891	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Manutenção preventiva, Limpeza interna, desoxidação das placas e troca da pasta térmica. Eliminando barulho estranho causado pelo cooler da fonte muito sujo. : R$ 100,00\n\n[{"name":"Manutenção preventiva, Limpeza interna, desoxidação das placas e troca da pasta térmica. Eliminando barulho estranho causado pelo cooler da fonte muito sujo. ","description":"Manutenção preventiva, Limpeza interna, desoxidação das placas e troca da pasta térmica. Eliminando barulho estranho causado pelo cooler da fonte muito sujo. ","type":"servico","unitPrice":100,"price":100,"amount":100,"quantity":1}]	484	100.00	0.00	[{"name":"Manutenção preventiva, Limpeza interna, desoxidação das placas e troca da pasta térmica. Eliminando barulho estranho causado pelo cooler da fonte muito sujo. ","amount":100,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-12-03 12:24:22.906891	\N	0.00	9
1164	Computador parou de ligar	149	\N	entrada	400.00	pago	\N	2025-12-04 11:11:30.878	2025-11-26 14:35:43.094	1	2025-12-04 11:11:31.346	1	\N	\N	\N	\N	Computador parou de ligar\n\nDiscriminação de valores:\n\nServiços:\n- Manutenção preventiva (limpeza, pasta térmica e desoxidação das memórias), instalação SSD, substituição fonte de alimentação, instalação do windows e programas: R$ 150,00\n\nProdutos/Materiais:\n- Fonte ATX 12v 24p: R$ 120,00\n- SSD 120gb: R$ 150,00\n\n[{"name":"Manutenção preventiva (limpeza, pasta térmica e desoxidação das memórias), instalação SSD, substituição fonte de alimentação, instalação do windows e programas","description":"Manutenção preventiva (limpeza, pasta térmica e desoxidação das memórias), instalação SSD, substituição fonte de alimentação, instalação do windows e programas","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1},{"name":"Fonte ATX 12v 24p","amount":120,"quantity":1,"type":"produto"},{"name":"SSD 120gb","description":"SSD 120gb","type":"produto","unitPrice":150,"price":150,"amount":150,"quantity":1}]\n\n--- DESCONTO APLICADO ---\nValor original: R$ 420,00\nDesconto: R$ 20,00\nValor final: R$ 400,00	478	150.00	270.00	[{"name":"Manutenção preventiva (limpeza, pasta térmica e desoxidação das memórias), instalação SSD, substituição fonte de alimentação, instalação do windows e programas","amount":150,"quantity":1,"type":"servico"}]	[{"name":"Fonte ATX 12v 24p","amount":120,"quantity":1,"type":"produto"},{"name":"SSD 120gb","amount":150,"quantity":1,"type":"produto"}]	\N	\N	2025-11-26 14:35:43.111872	420.00	20.00	1
1193	Máquina de Célia com pouca memória. 	56	177	entrada	1000.00	pago	\N	2025-12-13 02:21:01.137	2025-12-03 12:23:17.012	9	2025-12-13 02:21:01.691	9	\N	\N	\N	\N	Discriminação de valores:\n\nProdutos/Materiais:\n- Desktop novo Dell Optplex 3070 P/ Financeiro. Processador Corei3, 8GB memória RAM, SSD 128GB com Windows e programas instalado. : R$ 1000,00\n\n[{"name":"Desktop novo Dell Optplex 3070 P/ Financeiro. Processador Corei3, 8GB memória RAM, SSD 128GB com Windows e programas instalado. ","description":"Desktop novo Dell Optplex 3070 P/ Financeiro. Processador Corei3, 8GB memória RAM, SSD 128GB com Windows e programas instalado. ","type":"produto","unitPrice":1000,"price":1000,"amount":1000,"quantity":1}]	513	0.00	1000.00	[]	[{"name":"Desktop novo Dell Optplex 3070 P/ Financeiro. Processador Corei3, 8GB memória RAM, SSD 128GB com Windows e programas instalado. ","amount":1000,"quantity":1,"type":"produto"}]	\N	\N	2025-12-03 12:23:17.028555	\N	0.00	9
1196	Ajustes nos sistemas de câmeras de Upanema e Mossoró	21	\N	entrada	100.00	pago	\N	2025-12-20 16:17:59.337	2025-12-03 15:09:11.093	1	2025-12-20 16:17:59.573	1	\N	\N	\N	\N	Ajustes nos sistemas de câmeras de Upanema e Mossoró\n\nDiscriminação de valores:\n\nServiços:\n- Visita técnica com resolução no local. Ajustes na configuração do sistema de câmeras e revisão no sistema de backups do sistema Arpa.: R$ 100,00\n\n[{"name":"Visita técnica com resolução no local. Ajustes na configuração do sistema de câmeras e revisão no sistema de backups do sistema Arpa.","description":"Visita técnica com resolução no local. Ajustes na configuração do sistema de câmeras e revisão no sistema de backups do sistema Arpa.","type":"servico","unitPrice":100,"price":100,"amount":100,"quantity":1}]	519	100.00	0.00	[{"name":"Visita técnica com resolução no local. Ajustes na configuração do sistema de câmeras e revisão no sistema de backups do sistema Arpa.","amount":100,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-12-03 15:09:11.096495	\N	0.00	1
1201	PC Janaíne parou de funcionar após queda de energia	14	258	entrada	220.00	pago	\N	2026-01-05 17:33:37.726	2025-12-10 17:22:44.925	1	2026-01-05 17:33:38.155	1	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Visita técnica com reposição do componente danificado e testes no equipamento: R$ 100,00\n\nProdutos/Materiais:\n- Fonte ATX 12v 200w: R$ 120,00\n\n[{"name":"Fonte ATX 12v 200w","description":"Fonte ATX 12v 200w","type":"produto","unitPrice":120,"price":120,"amount":120,"quantity":1},{"name":"Visita técnica com reposição do componente danificado e testes no equipamento","description":"Visita técnica com reposição do componente danificado e testes no equipamento","type":"servico","unitPrice":100,"price":100,"amount":100,"quantity":1}]	526	100.00	120.00	[{"name":"Visita técnica com reposição do componente danificado e testes no equipamento","amount":100,"quantity":1,"type":"servico"}]	[{"name":"Fonte ATX 12v 200w","amount":120,"quantity":1,"type":"produto"}]	\N	\N	2025-12-10 17:22:44.941263	\N	0.00	1
1203	Obra medical center. Desmontagem e passagem dos novos cabos para efetuar obra. Remontagem de equipamentos após obra. Só falta agora colocar as 4 câmeras pra funcionar. Foram usados 200 metros de cabo. 2 canaletas. 4 câmeras recepção e faixada.	28	105	entrada	2598.00	pendente	\N	\N	2025-12-13 02:16:33.842	5	2025-12-13 02:16:33.858998	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Desmontagem dos equipamentos do balcão, remoção de toda a fiação e canaletas antigas. Passagem embutida dos novos cabos das câmeras, rede do balcão e sensores de alarme. Montagem dos equipamentos, testes de funcionamento e configuração da rede.: R$ 604,00\n- 4x Serviço de instalação e configuração de câmera. (R$ 50,00 cada): R$ 200,00\n\nProdutos/Materiais:\n- 220x Cabo de rede RJ45 CAT5 5.E  100% cobre. (R$ 3,70 cada): R$ 814,00\n- 2x Canaleta adesiva 1 via. P/ Cabo Telefone Laboratório. (R$ 10,00 cada): R$ 20,00\n- 4x Câmera Intelbras VHD 1220 D MIC FULL HD  (R$ 210,00 cada): R$ 840,00\n- 4x Par Ballun de vídeo Intelbras. P/ Câmeras. (R$ 25,00 cada): R$ 100,00\n- 4x Conector de energia P4. (R$ 5,00 cada): R$ 20,00\n\n[{"name":"Desmontagem dos equipamentos do balcão, remoção de toda a fiação e canaletas antigas. Passagem embutida dos novos cabos das câmeras, rede do balcão e sensores de alarme. Montagem dos equipamentos, testes de funcionamento e configuração da rede.","description":"Desmontagem dos equipamentos do balcão, remoção de toda a fiação e canaletas antigas. Passagem embutida dos novos cabos das câmeras, rede do balcão e sensores de alarme. Montagem dos equipamentos, testes de funcionamento e configuração da rede.","type":"servico","unitPrice":604,"price":604,"amount":604,"quantity":1},{"name":"Cabo de rede RJ45 CAT5 5.E  100% cobre.","description":"Cabo de rede RJ45 CAT5 5.E  100% cobre.","type":"produto","unitPrice":3.7,"price":814,"amount":814,"quantity":220},{"name":"Canaleta adesiva 1 via. P/ Cabo Telefone Laboratório.","description":"Canaleta adesiva 1 via. P/ Cabo Telefone Laboratório.","type":"produto","unitPrice":10,"price":20,"amount":20,"quantity":2},{"name":"Câmera Intelbras VHD 1220 D MIC FULL HD ","description":"Câmera Intelbras VHD 1220 D MIC FULL HD ","type":"produto","unitPrice":210,"price":840,"amount":840,"quantity":4},{"name":"Serviço de instalação e configuração de câmera.","description":"Serviço de instalação e configuração de câmera.","type":"servico","unitPrice":50,"price":200,"amount":200,"quantity":4},{"name":"Par Ballun de vídeo Intelbras. P/ Câmeras.","description":"Par Ballun de vídeo Intelbras. P/ Câmeras.","type":"produto","unitPrice":25,"price":100,"amount":100,"quantity":4},{"name":"Conector de energia P4.","description":"Conector de energia P4.","type":"produto","unitPrice":5,"price":20,"amount":20,"quantity":4}]	452	804.00	1794.00	[{"name":"Desmontagem dos equipamentos do balcão, remoção de toda a fiação e canaletas antigas. Passagem embutida dos novos cabos das câmeras, rede do balcão e sensores de alarme. Montagem dos equipamentos, testes de funcionamento e configuração da rede.","amount":604,"quantity":1,"type":"servico"},{"name":"Serviço de instalação e configuração de câmera.","amount":200,"quantity":4,"type":"servico"}]	[{"name":"Cabo de rede RJ45 CAT5 5.E  100% cobre.","amount":814,"quantity":220,"type":"produto"},{"name":"Canaleta adesiva 1 via. P/ Cabo Telefone Laboratório.","amount":20,"quantity":2,"type":"produto"},{"name":"Câmera Intelbras VHD 1220 D MIC FULL HD ","amount":840,"quantity":4,"type":"produto"},{"name":"Par Ballun de vídeo Intelbras. P/ Câmeras.","amount":100,"quantity":4,"type":"produto"},{"name":"Conector de energia P4.","amount":20,"quantity":4,"type":"produto"}]	\N	\N	2025-12-13 02:16:33.858998	\N	0.00	5
1212	Visita técnica para reset e reconfiguração de todas as antenas/access points Unifi da pousada, devido à perda do servidor anterior. O serviço demandará um dia ou mais para conclusão	62	337	entrada	795.00	pendente	\N	\N	2025-12-13 02:36:48.129	5	2025-12-15 16:36:42.024	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Visita técnica para reset e reconfiguração de todas as antenas/access points Unifi da pousada, devido à perda do servidor anterior. O serviço demandará um dia ou mais para conclusão.: R$ 400,00\n- Combustível referente a logística para dois técnicos. Mossoró/Tibau, Tibau/Mossoró.: R$ 50,00\n- Alimentação noturna para dois técnicos durante duas diárias de serviço.: R$ 150,00\n\nProdutos/Materiais:\n- 70x Cabo de rede CAT5.E 100% Cobre. (R$ 3,50 cada): R$ 245,00\n\n[{"name":"Visita técnica para reset e reconfiguração de todas as antenas/access points Unifi da pousada, devido à perda do servidor anterior. O serviço demandará um dia ou mais para conclusão.","description":"Visita técnica para reset e reconfiguração de todas as antenas/access points Unifi da pousada, devido à perda do servidor anterior. O serviço demandará um dia ou mais para conclusão.","type":"servico","unitPrice":400,"price":400,"amount":400,"quantity":1},{"name":"Combustível referente a logística para dois técnicos. Mossoró/Tibau, Tibau/Mossoró.","description":"Combustível referente a logística para dois técnicos. Mossoró/Tibau, Tibau/Mossoró.","type":"servico","unitPrice":50,"price":50,"amount":50,"quantity":1},{"name":"Alimentação noturna para dois técnicos durante duas diárias de serviço.","description":"Alimentação noturna para dois técnicos durante duas diárias de serviço.","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1},{"name":"Cabo de rede CAT5.E 100% Cobre.","description":"Cabo de rede CAT5.E 100% Cobre.","type":"produto","unitPrice":3.5,"price":245,"amount":245,"quantity":70}]\n\n--- DESCONTO APLICADO ---\nValor original: R$ 845,00\nDesconto: R$ 50,00\nValor final: R$ 795,00	337	600.00	245.00	[{"name":"Visita técnica para reset e reconfiguração de todas as antenas/access points Unifi da pousada, devido à perda do servidor anterior. O serviço demandará um dia ou mais para conclusão.","amount":400,"quantity":1,"type":"servico"},{"name":"Combustível referente a logística para dois técnicos. Mossoró/Tibau, Tibau/Mossoró.","amount":50,"quantity":1,"type":"servico"},{"name":"Alimentação noturna para dois técnicos durante duas diárias de serviço.","amount":150,"quantity":1,"type":"servico"}]	[{"name":"Cabo de rede CAT5.E 100% Cobre.","amount":245,"quantity":70,"type":"produto"}]	\N	\N	2025-12-13 02:36:48.145591	845.00	50.00	5
1255	Impressora Epson imprimindo em branco	109	291	entrada	150.00	pago	\N	2026-01-13 02:33:29.971	2026-01-13 02:32:57.383	1	2026-01-13 02:33:30.267	1	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Manutenção completa na impressora com remoção de ar da tubulação e desobstrução dos suspiros do tanque de tintas: R$ 150,00\n\n[{"name":"Manutenção completa na impressora com remoção de ar da tubulação e desobstrução dos suspiros do tanque de tintas","description":"Manutenção completa na impressora com remoção de ar da tubulação e desobstrução dos suspiros do tanque de tintas","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1}]	568	150.00	0.00	[{"name":"Manutenção completa na impressora com remoção de ar da tubulação e desobstrução dos suspiros do tanque de tintas","amount":150,"quantity":1,"type":"servico"}]	[]	\N	\N	2026-01-13 02:32:57.401086	\N	0.00	1
1269	IMP recepção Bestlaser	24	\N	entrada	0.00	pendente	\N	\N	2026-01-14 15:51:16.186	9	2026-01-14 15:51:16.204191	\N	\N	\N	\N	\N	IMP recepção Bestlaser\n\nDiscriminação de valores:\n\nServiços:\n- Manutenção impressora Epson, desentupimento dos bicos/cabeça de impressão, limpeza interna e lubrificação. : R$ 0,00\n\n[{"name":"Manutenção impressora Epson, desentupimento dos bicos/cabeça de impressão, limpeza interna e lubrificação. ","description":"Manutenção impressora Epson, desentupimento dos bicos/cabeça de impressão, limpeza interna e lubrificação. ","type":"servico","unitPrice":0,"price":0,"amount":0,"quantity":1}]	581	0.00	0.00	[{"name":"Manutenção impressora Epson, desentupimento dos bicos/cabeça de impressão, limpeza interna e lubrificação. ","amount":0,"quantity":1,"type":"servico"},{"name":"IMP recepção Bestlaser","amount":0,"type":"servico"}]	[]	\N	\N	2026-01-14 15:51:16.204191	\N	0.00	9
1266	08/12 - Odete queda da brisa. 	8	\N	entrada	80.00	pendente	\N	\N	2025-12-08 03:00:00	9	2026-01-15 17:47:05.033	\N	\N	\N	\N	\N	Odete queda da brisa. \n\nDiscriminação de valores:\n\nServiços:\n- Acesso remoto seguido de visita técnica para verificar problema no link da brisa. Foi constatado que a fibra tinha sido rompida. Brisanet acionada para reparar a fibra. : R$ 80,00\n\n[{"name":"Acesso remoto seguido de visita técnica para verificar problema no link da brisa. Foi constatado que a fibra tinha sido rompida. Brisanet acionada para reparar a fibra. ","description":"Acesso remoto seguido de visita técnica para verificar problema no link da brisa. Foi constatado que a fibra tinha sido rompida. Brisanet acionada para reparar a fibra. ","type":"servico","unitPrice":80,"price":80,"amount":80,"quantity":1}]	579	80.00	0.00	[{"name":"Acesso remoto seguido de visita técnica para verificar problema no link da brisa. Foi constatado que a fibra tinha sido rompida. Brisanet acionada para reparar a fibra. ","amount":80,"quantity":1,"type":"servico"}]	[]	\N	\N	2026-01-14 11:45:48.622404	\N	0.00	9
1204	Parcela 1 - Obra medical center. Desmontagem e passagem dos novos cabos para efetuar obra. Remontagem de equipamentos após obra. Só falta agora colocar as 4 câmeras pra funcionar. Foram usados 200 metros de cabo. 2 canaletas. 4 câmeras recepção e faixada.	28	105	entrada	519.60	pendente	2026-01-05 00:00:00	\N	2025-12-13 02:19:12.287	5	2025-12-13 02:19:12.30397	\N	\N	1203	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-13 02:19:12.30397	\N	0.00	5
1205	Parcela 2 - Obra medical center. Desmontagem e passagem dos novos cabos para efetuar obra. Remontagem de equipamentos após obra. Só falta agora colocar as 4 câmeras pra funcionar. Foram usados 200 metros de cabo. 2 canaletas. 4 câmeras recepção e faixada.	28	105	entrada	519.60	pendente	2026-02-05 00:00:00	\N	2025-12-13 02:19:13.769	5	2025-12-13 02:19:13.785449	\N	\N	1203	2	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-13 02:19:13.785449	\N	0.00	5
1206	Parcela 3 - Obra medical center. Desmontagem e passagem dos novos cabos para efetuar obra. Remontagem de equipamentos após obra. Só falta agora colocar as 4 câmeras pra funcionar. Foram usados 200 metros de cabo. 2 canaletas. 4 câmeras recepção e faixada.	28	105	entrada	519.60	pendente	2026-03-05 00:00:00	\N	2025-12-13 02:19:14.94	5	2025-12-13 02:19:14.958205	\N	\N	1203	3	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-13 02:19:14.958205	\N	0.00	5
1207	Parcela 4 - Obra medical center. Desmontagem e passagem dos novos cabos para efetuar obra. Remontagem de equipamentos após obra. Só falta agora colocar as 4 câmeras pra funcionar. Foram usados 200 metros de cabo. 2 canaletas. 4 câmeras recepção e faixada.	28	105	entrada	519.60	pendente	2026-04-05 00:00:00	\N	2025-12-13 02:19:16.105	5	2025-12-13 02:19:16.121504	\N	\N	1203	4	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-13 02:19:16.121504	\N	0.00	5
1208	Parcela 5 - Obra medical center. Desmontagem e passagem dos novos cabos para efetuar obra. Remontagem de equipamentos após obra. Só falta agora colocar as 4 câmeras pra funcionar. Foram usados 200 metros de cabo. 2 canaletas. 4 câmeras recepção e faixada.	28	105	entrada	519.60	pendente	2026-05-05 00:00:00	\N	2025-12-13 02:19:17.618	5	2025-12-13 02:19:17.63503	\N	\N	1203	5	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-13 02:19:17.63503	\N	0.00	5
1202	Problema mouse para e upgrade de memória	122	108	entrada	340.00	pago	\N	2025-12-13 02:19:26.566	2025-12-13 02:11:37.294	9	2025-12-13 02:19:27.061	9	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Serviço. : R$ 80,00\n\nProdutos/Materiais:\n- Memória.: R$ 260,00\n\n[{"name":"Serviço. ","description":"Serviço. ","type":"servico","unitPrice":80,"price":80,"amount":80,"quantity":1},{"name":"Memória.","description":"Memória.","type":"produto","unitPrice":260,"price":260,"amount":260,"quantity":1}]	445	80.00	260.00	[{"name":"Serviço. ","amount":80,"quantity":1,"type":"servico"}]	[{"name":"Memória.","amount":260,"quantity":1,"type":"produto"}]	\N	\N	2025-12-13 02:11:37.310647	\N	0.00	9
1213	Verificar Pc na loja. ..	94	331	entrada	700.00	pendente	\N	\N	2025-12-13 02:38:32.304	5	2025-12-13 02:38:32.320612	\N	\N	\N	\N	\N	Discriminação de valores:\n\nProdutos/Materiais:\n- Desktop PC: R$ 700,00\n\n[{"name":"Desktop PC","description":"Desktop PC","type":"produto","unitPrice":700,"price":700,"amount":700,"quantity":1}]	359	0.00	700.00	[]	[{"name":"Desktop PC","amount":700,"quantity":1,"type":"produto"}]	\N	\N	2025-12-13 02:38:32.320612	\N	0.00	5
1221	Espetinhos com o amigo Jorge kk	\N	\N	saida	35.00	pago	\N	2025-12-15 03:00:00	2025-12-15 21:50:17.418	1	2025-12-15 21:50:17.702967	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-15 21:50:17.702967	\N	0.00	1
1227	Fonte ATX, Fonte IMP cupom, Roteador W6.	171	\N	entrada	585.00	pendente	\N	\N	2025-12-17 16:35:38.304	9	2025-12-17 16:35:38.321972	\N	\N	\N	\N	\N	Fonte ATX, Fonte IMP cupom, Roteador W6.\n\nDiscriminação de valores:\n\nServiços:\n- Desktop - Limpeza interna, desoxidação das placas e troca da pasta térmica. Backup Nuvem com link, formatação, instalação do sistema e programas. Suporte remoto.: R$ 150,00\n- ​Configuração e parametrização de roteador dedicado para integração de rede (Estação/Equipamento de Exames), incluindo setup e sincronização do software cliente. (Cortesia): R$ 0,00\n\nProdutos/Materiais:\n- Fonte ATX 24Pinos: R$ 120,00\n- Fonte alimentação impressora Cupom.: R$ 150,00\n- Roteador Intelbras RF301K N300 Fast Ethernet.: R$ 165,00\n\n[{"name":"Desktop - Limpeza interna, desoxidação das placas e troca da pasta térmica. Backup Nuvem com link, formatação, instalação do sistema e programas. Suporte remoto.","amount":150,"quantity":1,"type":"servico"},{"name":"​Configuração e parametrização de roteador dedicado para integração de rede (Estação/Equipamento de Exames), incluindo setup e sincronização do software cliente. (Cortesia)","amount":0.001,"quantity":1,"type":"servico"},{"name":"Fonte ATX 24Pinos","amount":120,"quantity":1,"type":"produto"},{"name":"Fonte alimentação impressora Cupom.","amount":150,"quantity":1,"type":"produto"},{"name":"Roteador Intelbras RF301K N300 Fast Ethernet.","description":"Roteador Intelbras RF301K N300 Fast Ethernet.","type":"produto","unitPrice":165,"price":165,"amount":165,"quantity":1}]	543	150.00	435.00	[{"name":"Desktop - Limpeza interna, desoxidação das placas e troca da pasta térmica. Backup Nuvem com link, formatação, instalação do sistema e programas. Suporte remoto.","amount":150,"quantity":1,"type":"servico"},{"name":"​Configuração e parametrização de roteador dedicado para integração de rede (Estação/Equipamento de Exames), incluindo setup e sincronização do software cliente. (Cortesia)","amount":0.001,"quantity":1,"type":"servico"}]	[{"name":"Fonte ATX 24Pinos","amount":120,"quantity":1,"type":"produto"},{"name":"Fonte alimentação impressora Cupom.","amount":150,"quantity":1,"type":"produto"},{"name":"Roteador Intelbras RF301K N300 Fast Ethernet.","amount":165,"quantity":1,"type":"produto"}]	\N	\N	2025-12-17 16:35:38.321972	\N	0.00	9
1229	Reparo no nobreak do servidor	41	\N	entrada	380.00	pendente	\N	\N	2025-12-17 20:37:30.959	1	2025-12-17 20:37:30.977182	\N	\N	\N	\N	\N	Comprar baterias para fazer a substituição\n\nDiscriminação de valores:\n\nServiços:\n- Serviços de diagnóstico e resolução do problema no nobreak: R$ 100,00\n\nProdutos/Materiais:\n- 2x Bateria selada 12v 7ah Intelbras (R$ 140,00 cada): R$ 280,00\n\n[{"name":"Bateria selada 12v 7ah Intelbras","description":"Bateria selada 12v 7ah Intelbras","type":"produto","unitPrice":140,"price":280,"amount":280,"quantity":2},{"name":"Serviços de diagnóstico e resolução do problema no nobreak","description":"Serviços de diagnóstico e resolução do problema no nobreak","type":"servico","unitPrice":100,"price":100,"amount":100,"quantity":1}]	521	100.00	280.00	[{"name":"Serviços de diagnóstico e resolução do problema no nobreak","amount":100,"quantity":1,"type":"servico"}]	[{"name":"Bateria selada 12v 7ah Intelbras","amount":280,"quantity":2,"type":"produto"}]	\N	\N	2025-12-17 20:37:30.977182	\N	0.00	1
1232	Kalione compra dos Lenovos 	\N	\N	saida	450.00	pago	\N	2025-12-19 03:00:00	2025-12-19 10:15:22.6	1	2025-12-19 10:15:22.958487	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-19 10:15:22.958487	\N	0.00	1
1233	Suporte remoto para instalação de impressora na rede e nos computadores	174	\N	entrada	50.00	pago	\N	2025-12-19 13:09:49.73	2025-12-19 13:09:24.577	1	2025-12-19 13:09:50.008	1	\N	\N	\N	\N	Discriminação de valores:\n\nProdutos/Materiais:\n- Serviço  Suporte remoto para instalação de impressora na rede e nos computadores: R$ 50,00\n\n[{"name":"Serviço  Suporte remoto para instalação de impressora na rede e nos computadores","description":"Serviço  Suporte remoto para instalação de impressora na rede e nos computadores","type":"produto","unitPrice":50,"price":50,"amount":50,"quantity":1}]	546	0.00	50.00	[]	[{"name":"Serviço  Suporte remoto para instalação de impressora na rede e nos computadores","amount":50,"quantity":1,"type":"produto"}]	\N	\N	2025-12-19 13:09:24.593959	\N	0.00	1
1234	Parcela 5 - Parcelamento avulso materiais e serviços 	21	\N	entrada	300.00	pago	\N	2025-12-20 16:17:49.597	2025-12-20 16:17:37.215	1	2025-12-20 16:17:50.105	1	\N	377	5	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-20 16:17:37.232616	\N	0.00	1
1256	Kalione	\N	\N	saida	400.00	pago	\N	2026-01-13 03:00:00	2026-01-13 02:34:46.403	1	2026-01-13 02:34:46.420787	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-13 02:34:46.420787	\N	0.00	1
1198	Orçamento passagem do cabo 	167	249	entrada	550.00	pago	\N	2025-12-13 02:20:37.388	2025-12-09 13:44:39.969	9	2025-12-13 02:20:37.888	9	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Serviço de análise e execução, incluindo passagem do cabo pela tubulação embutida no chão, abertura e preparo do solo para construção da nova rota da tubulação interligando a casa à infraestrutura de rede da sala das câmeras. Instalação e configuração do roteador responsável por receber o sinal do cabeamento e distribuir a rede Wi-Fi.: R$ 350,00\n\nProdutos/Materiais:\n- Rolo 30M de mangueira de irrigação 1/2” utilizado como duto para passagem e proteção do cabo.: R$ 80,00\n- 50x Cabo de rede Furukawa RJ45 CAT5.E 100% Cobre (R$ 3,70 cada): R$ 185,00\n- 2x Conectores de Rede RJ45 CAT6 (R$ 4,00 cada): R$ 8,00\n\n[{"name":"Serviço de análise e execução, incluindo passagem do cabo pela tubulação embutida no chão, abertura e preparo do solo para construção da nova rota da tubulação interligando a casa à infraestrutura de rede da sala das câmeras. Instalação e configuração do roteador responsável por receber o sinal do cabeamento e distribuir a rede Wi-Fi.","description":"Serviço de análise e execução, incluindo passagem do cabo pela tubulação embutida no chão, abertura e preparo do solo para construção da nova rota da tubulação interligando a casa à infraestrutura de rede da sala das câmeras. Instalação e configuração do roteador responsável por receber o sinal do cabeamento e distribuir a rede Wi-Fi.","type":"servico","unitPrice":350,"price":350,"amount":350,"quantity":1},{"name":"Rolo 30M de mangueira de irrigação 1/2” utilizado como duto para passagem e proteção do cabo.","description":"Rolo 30M de mangueira de irrigação 1/2” utilizado como duto para passagem e proteção do cabo.","type":"produto","unitPrice":80,"price":80,"amount":80,"quantity":1},{"name":"Cabo de rede Furukawa RJ45 CAT5.E 100% Cobre","description":"Cabo de rede Furukawa RJ45 CAT5.E 100% Cobre","type":"produto","unitPrice":3.7,"price":185,"amount":185,"quantity":50},{"name":"Conectores de Rede RJ45 CAT6","description":"Conectores de Rede RJ45 CAT6","type":"produto","unitPrice":4,"price":8,"amount":8,"quantity":2}]\n\n--- DESCONTO APLICADO ---\nValor original: R$ 623,00\nDesconto: R$ 73,00\nValor final: R$ 550,00	520	350.00	273.00	[{"name":"Serviço de análise e execução, incluindo passagem do cabo pela tubulação embutida no chão, abertura e preparo do solo para construção da nova rota da tubulação interligando a casa à infraestrutura de rede da sala das câmeras. Instalação e configuração do roteador responsável por receber o sinal do cabeamento e distribuir a rede Wi-Fi.","amount":350,"quantity":1,"type":"servico"}]	[{"name":"Rolo 30M de mangueira de irrigação 1/2” utilizado como duto para passagem e proteção do cabo.","amount":80,"quantity":1,"type":"produto"},{"name":"Cabo de rede Furukawa RJ45 CAT5.E 100% Cobre","amount":185,"quantity":50,"type":"produto"},{"name":"Conectores de Rede RJ45 CAT6","amount":8,"quantity":2,"type":"produto"}]	\N	\N	2025-12-09 13:44:39.989535	623.00	73.00	9
1214	Parcela 1 - Verificar Pc na loja. ..	94	331	entrada	350.00	pendente	2025-11-12 00:00:00	\N	2025-12-13 02:40:04.669	5	2025-12-13 02:40:04.686284	\N	\N	1213	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-13 02:40:04.686284	\N	0.00	5
1215	Parcela 2 - Verificar Pc na loja. ..	94	331	entrada	350.00	pendente	2025-12-12 00:00:00	\N	2025-12-13 02:40:06.08	5	2025-12-13 02:40:06.096803	\N	\N	1213	2	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-13 02:40:06.096803	\N	0.00	5
1224	Reparo Impressora Epson	101	\N	entrada	235.00	pendente	\N	\N	2025-12-16 15:36:55.691	9	2025-12-16 15:37:08.482	\N	\N	\N	\N	\N	Reparo Impressora Epson\n\nDiscriminação de valores:\n\nServiços:\n- Diagnóstico e reparo, seguido de limpeza interna. Troca do conjunto de cabo flat da cabeça de impressão. Troca tubulação tanque de tinta preto.: R$ 150,00\n\nProdutos/Materiais:\n- Kit Conjunto cabo flat cabeça de impressora Epson l3150.: R$ 100,00\n- Mangueira/tubulação tanque de tinta preto Epson l3150: R$ 35,00\n\n[{"name":"Diagnóstico e reparo, seguido de limpeza interna. Troca do conjunto de cabo flat da cabeça de impressão. Troca tubulação tanque de tinta preto.","description":"Diagnóstico e reparo, seguido de limpeza interna. Troca do conjunto de cabo flat da cabeça de impressão. Troca tubulação tanque de tinta preto.","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1},{"name":"Kit Conjunto cabo flat cabeça de impressora Epson l3150.","description":"Kit Conjunto cabo flat cabeça de impressora Epson l3150.","type":"produto","unitPrice":100,"price":100,"amount":100,"quantity":1},{"name":"Mangueira/tubulação tanque de tinta preto Epson l3150","description":"Mangueira/tubulação tanque de tinta preto Epson l3150","type":"produto","unitPrice":35,"price":35,"amount":35,"quantity":1}]\n\n--- DESCONTO APLICADO ---\nValor original: R$ 285,00\nDesconto: R$ 50,00\nValor final: R$ 235,00	539	150.00	135.00	[{"name":"Diagnóstico e reparo, seguido de limpeza interna. Troca do conjunto de cabo flat da cabeça de impressão. Troca tubulação tanque de tinta preto.","amount":150,"quantity":1,"type":"servico"}]	[{"name":"Kit Conjunto cabo flat cabeça de impressora Epson l3150.","amount":100,"quantity":1,"type":"produto"},{"name":"Mangueira/tubulação tanque de tinta preto Epson l3150","amount":35,"quantity":1,"type":"produto"}]	\N	\N	2025-12-16 15:36:55.707968	285.00	50.00	9
1223	Acesso remoto para ajustes na configuração da impressora na recepção	83	\N	entrada	50.00	pago	\N	2025-12-16 17:04:12.857	2025-12-16 14:11:53.124	1	2025-12-16 17:04:13.356	1	\N	\N	\N	\N	Acesso remoto para ajustes na configuração da impressora na recepção\n\nDiscriminação de valores:\n\nServiços:\n- Acesso remoto para ajustes na configuração da impressora na recepção: R$ 50,00\n\n[{"name":"Acesso remoto para ajustes na configuração da impressora na recepção","description":"Acesso remoto para ajustes na configuração da impressora na recepção","type":"servico","unitPrice":50,"price":50,"amount":50,"quantity":1}]	538	50.00	0.00	[{"name":"Acesso remoto para ajustes na configuração da impressora na recepção","amount":50,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-12-16 14:11:53.142087	\N	0.00	1
1230	Computador balcão do canto está se desligando e muito lento, travando.	41	240	entrada	270.00	pendente	\N	\N	2025-12-17 20:39:16.125	1	2025-12-17 20:39:16.143091	\N	\N	\N	\N	\N	Windows corrompido. Ver possibilidade de upgrade na máquina, talvez colocar SSD.\n\nDiscriminação de valores:\n\nServiços:\n- Substituição do SSD, fonte de alimentação e gabinete. Peças foram reutilizadas de CPU da status que apresentou problemas na placa mãe e estava guardada na assistência.: R$ 150,00\n\nProdutos/Materiais:\n- Fonte ATX 12v 200w: R$ 120,00\n\n[{"name":"Fonte ATX 12v 200w","description":"Fonte ATX 12v 200w","type":"produto","unitPrice":120,"price":120,"amount":120,"quantity":1},{"name":"Substituição do SSD, fonte de alimentação e gabinete. Peças foram reutilizadas de CPU da status que apresentou problemas na placa mãe e estava guardada na assistência.","description":"Substituição do SSD, fonte de alimentação e gabinete. Peças foram reutilizadas de CPU da status que apresentou problemas na placa mãe e estava guardada na assistência.","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1}]	527	150.00	120.00	[{"name":"Substituição do SSD, fonte de alimentação e gabinete. Peças foram reutilizadas de CPU da status que apresentou problemas na placa mãe e estava guardada na assistência.","amount":150,"quantity":1,"type":"servico"}]	[{"name":"Fonte ATX 12v 200w","amount":120,"quantity":1,"type":"produto"}]	\N	\N	2025-12-17 20:39:16.143091	\N	0.00	1
1228	Desktop Taffarel	171	\N	entrada	1000.00	pago	\N	2025-12-26 19:18:33.445	2025-12-17 16:37:50.205	9	2025-12-26 19:18:32.489	9	\N	\N	\N	\N	Desktop\n\nDiscriminação de valores:\n\nProdutos/Materiais:\n- Pc Completo - Montor 15 polegadas. Teclado e Mouse. CPU Lenovo Bivolt, Corei3, 4gb RAM, SSD 240GB.: R$ 1000,00\n\n[{"name":"Pc Completo - Montor 15 polegadas. Teclado e Mouse. CPU Lenovo Bivolt, Corei3, 4gb RAM, SSD 240GB.","description":"Pc Completo - Montor 15 polegadas. Teclado e Mouse. CPU Lenovo Bivolt, Corei3, 4gb RAM, SSD 240GB.","type":"produto","unitPrice":1000,"price":1000,"amount":1000,"quantity":1}]	544	0.00	1000.00	[]	[{"name":"Pc Completo - Montor 15 polegadas. Teclado e Mouse. CPU Lenovo Bivolt, Corei3, 4gb RAM, SSD 240GB.","amount":1000,"quantity":1,"type":"produto"}]	\N	\N	2025-12-17 16:37:50.223474	\N	0.00	9
1257	Kalione	\N	\N	saida	400.00	pago	\N	2026-01-13 02:35:39.386	2026-01-13 02:35:30.25	1	2026-01-13 02:35:39.431	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-13 02:35:30.520303	\N	0.00	1
1192	Acesso remoto para instalar pacote office.	151	223	entrada	80.00	pago	\N	2025-12-13 02:21:26.219	2025-12-03 12:20:36.27	9	2025-12-13 02:21:26.986	9	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Acesso remoto para reinstalar e ativar pacote office. : R$ 80,00\n\n[{"name":"Acesso remoto para reinstalar e ativar pacote office. ","description":"Acesso remoto para reinstalar e ativar pacote office. ","type":"servico","unitPrice":80,"price":80,"amount":80,"quantity":1}]	514	80.00	0.00	[{"name":"Acesso remoto para reinstalar e ativar pacote office. ","amount":80,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-12-03 12:20:36.293937	\N	0.00	9
162	Parcela 5/5 - Manutenção preventiva de todas as máquinas das 3 lojas. 	28	141	entrada	320.00	pago	2025-12-01 03:00:00	2025-12-13 02:21:45.939	2025-12-01 03:00:00	9	2025-12-13 02:21:46.435	9	\N	156	5	5	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	9
172	Parcela 5/5 - Roteador Intelbras configurado com a rede clientes na João da Escóssia.\n\nDiscriminação de valores:\n\nProdutos/Materiais:\n- Roteador Intelbras configurado com a rede clientes na João da Escóssia. : R$ 150,00\n\n[{"name":"Roteador Intelbras configurado com a rede clientes na João da Escóssia. ","amount":150,"type":"produto"}]	28	\N	entrada	30.00	pago	2025-12-01 03:00:00	2025-12-13 02:22:00.581	2025-12-01 03:00:00	9	2025-12-13 02:22:01.079	9	\N	100	5	5	\N	66	0.00	150.00	[]	[{"name":"Roteador Intelbras configurado com a rede clientes na João da Escóssia. ","amount":150,"type":"produto"}]	\N	\N	2025-08-13 21:36:49.633558	\N	0.00	9
1216	ROTINA DE BACKUP DOS BANCO DE DADOS.	8	353	entrada	0.00	pendente	\N	\N	2025-12-13 02:43:12.6	5	2025-12-13 02:43:12.617601	\N	\N	\N	\N	\N	\N	348	0.00	0.00	[{"name":"ROTINA DE BACKUP DOS BANCO DE DADOS.","amount":0,"type":"servico"}]	[]	\N	\N	2025-12-13 02:43:12.617601	\N	0.00	5
1220	Passagem da fibra óptica pelos postes levando para bloco ADM e recebendo conexão para interligar sistema de energia solar. 	11	\N	entrada	1496.00	pendente	\N	\N	2025-12-15 16:36:55.336	1	2025-12-15 16:38:05.546	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Mão de obra especializada para passagem e fixação do cabo até o bloco ADM, crimpagem dos conectores de fibra, testes e configuração da rede com adaptadores fibra/LAN, garantindo a conexão do sistema de energia solar.: R$ 350,00\n\nProdutos/Materiais:\n- 200x Cabo óptico fibra drop (R$ 3,00 cada): R$ 600,00\n- 2x Conector Rápido fibra óptica. (R$ 18,00 cada): R$ 36,00\n- 10x Esticadores para poste. Passagem do cabo.  (R$ 16,00 cada): R$ 160,00\n- Conversores de fibra optica para RJ45: R$ 350,00\n\n[{"name":"Mão de obra especializada para passagem e fixação do cabo até o bloco ADM, crimpagem dos conectores de fibra, testes e configuração da rede com adaptadores fibra/LAN, garantindo a conexão do sistema de energia solar.","description":"Mão de obra especializada para passagem e fixação do cabo até o bloco ADM, crimpagem dos conectores de fibra, testes e configuração da rede com adaptadores fibra/LAN, garantindo a conexão do sistema de energia solar.","type":"servico","unitPrice":350,"price":350,"amount":350,"quantity":1},{"name":"Cabo óptico fibra drop","description":"Cabo óptico fibra drop","type":"produto","unitPrice":3,"price":600,"amount":600,"quantity":200},{"name":"Conector Rápido fibra óptica.","description":"Conector Rápido fibra óptica.","type":"produto","unitPrice":18,"price":36,"amount":36,"quantity":2},{"name":"Esticadores para poste. Passagem do cabo. ","description":"Esticadores para poste. Passagem do cabo. ","type":"produto","unitPrice":16,"price":160,"amount":160,"quantity":10},{"name":"Conversores de fibra optica para RJ45","description":"Conversores de fibra optica para RJ45","type":"produto","unitPrice":350,"price":350,"amount":350,"quantity":1}]	242	350.00	1146.00	[{"name":"Mão de obra especializada para passagem e fixação do cabo até o bloco ADM, crimpagem dos conectores de fibra, testes e configuração da rede com adaptadores fibra/LAN, garantindo a conexão do sistema de energia solar.","amount":350,"quantity":1,"type":"servico"}]	[{"name":"Cabo óptico fibra drop","amount":600,"quantity":200,"type":"produto"},{"name":"Conector Rápido fibra óptica.","amount":36,"quantity":2,"type":"produto"},{"name":"Esticadores para poste. Passagem do cabo. ","amount":160,"quantity":10,"type":"produto"},{"name":"Conversores de fibra optica para RJ45","amount":350,"quantity":1,"type":"produto"}]	\N	\N	2025-12-15 16:36:55.353672	\N	0.00	1
1225	Fonte ATX e adaptador wifiusb	28	266	entrada	200.00	pendente	\N	\N	2025-12-16 15:42:57.693	9	2025-12-16 15:42:57.710055	\N	\N	\N	\N	\N	Discriminação de valores:\n\nProdutos/Materiais:\n- Fonte ATX 24 pinos P/ Desktop recepção Medical.: R$ 150,00\n- Adaptador Wifi/USB: R$ 50,00\n\n[{"name":"Fonte ATX 24 pinos P/ Desktop recepção Medical.","description":"Fonte ATX 24 pinos P/ Desktop recepção Medical.","type":"produto","unitPrice":150,"price":150,"amount":150,"quantity":1},{"name":"Adaptador Wifi/USB","description":"Adaptador Wifi/USB","type":"produto","unitPrice":50,"price":50,"amount":50,"quantity":1}]	540	0.00	200.00	[]	[{"name":"Fonte ATX 24 pinos P/ Desktop recepção Medical.","amount":150,"quantity":1,"type":"produto"},{"name":"Adaptador Wifi/USB","amount":50,"quantity":1,"type":"produto"}]	\N	\N	2025-12-16 15:42:57.710055	\N	0.00	9
514	Ajustes na estrutura de rede e instalação de switch 8 portas giga	21	241	entrada	245.00	pago	\N	2025-12-20 16:18:06.794	2025-10-08 03:00:00	1	2025-12-20 16:18:07.042	1	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Visita técnica para ajustes na rede, instalação switch e ajustes nas câmeras. Revisão no sistema de backups do sistema arpa.: R$ 150,00\n\nProdutos/Materiais:\n- Switch 8 portas giga TP-Link : R$ 95,00\n\n[{"name":"Switch 8 portas giga TP-Link ","description":"Switch 8 portas giga TP-Link ","type":"produto","unitPrice":95,"price":95,"amount":95,"quantity":1},{"name":"Visita técnica para ajustes na rede, instalação switch e ajustes nas câmeras. Revisão no sistema de backups do sistema arpa.","description":"Visita técnica para ajustes na rede, instalação switch e ajustes nas câmeras. Revisão no sistema de backups do sistema arpa.","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1}]	288	150.00	95.00	[{"name":"Visita técnica para ajustes na rede, instalação switch e ajustes nas câmeras. Revisão no sistema de backups do sistema arpa.","amount":150,"quantity":1,"type":"servico"}]	[{"name":"Switch 8 portas giga TP-Link ","amount":95,"quantity":1,"type":"produto"}]	\N	\N	2025-11-11 23:16:02.181725	\N	0.00	1
1231	CPU gamer liga mas não dá vídeo	172	260	entrada	250.00	pago	\N	2025-12-28 13:16:07.629	2025-12-17 20:41:56.062	1	2025-12-28 13:16:07.474	1	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Manutenção preventiva com troca de pasta térmica e bateria CMOS: R$ 100,00\n- Substituição do gabinete: R$ 1,00\n\nProdutos/Materiais:\n- Gabinete gamer ATX black: R$ 149,00\n\n[{"name":"Manutenção preventiva com troca de pasta térmica e bateria CMOS","description":"Manutenção preventiva com troca de pasta térmica e bateria CMOS","type":"servico","unitPrice":100,"price":100,"amount":100,"quantity":1},{"name":"Gabinete gamer ATX black","description":"Gabinete gamer ATX black","type":"produto","unitPrice":149,"price":149,"amount":149,"quantity":1},{"name":"Substituição do gabinete","description":"Substituição do gabinete","type":"servico","unitPrice":1,"price":1,"amount":1,"quantity":1}]	528	101.00	149.00	[{"name":"Manutenção preventiva com troca de pasta térmica e bateria CMOS","amount":100,"quantity":1,"type":"servico"},{"name":"Substituição do gabinete","amount":1,"quantity":1,"type":"servico"}]	[{"name":"Gabinete gamer ATX black","amount":149,"quantity":1,"type":"produto"}]	\N	\N	2025-12-17 20:41:56.079641	\N	0.00	1
1258	Chopp e pizza crocante em Tibau	\N	\N	saida	126.00	pago	\N	2026-01-13 02:41:39.823	2026-01-13 02:41:02.068	1	2026-01-13 02:41:40.227	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-13 02:41:02.336577	\N	0.00	1
1276	Pegar nobreak	101	277	entrada	230.00	pendente	\N	\N	2026-01-13 03:00:00	9	2026-01-19 12:08:06.61	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Nobreak - Diagnóstico e resolução. Troca da bateria 12/7 nobreak + limpeza interna.: R$ 80,00\n\nProdutos/Materiais:\n- Bateria Intelbras nobreak 12/7 ( 1 ano garantia ): R$ 150,00\n\n[{"name":"Nobreak - Diagnóstico e resolução. Troca da bateria 12/7 nobreak + limpeza interna.","description":"Nobreak - Diagnóstico e resolução. Troca da bateria 12/7 nobreak + limpeza interna.","type":"servico","unitPrice":80,"price":80,"amount":80,"quantity":1},{"name":"Bateria Intelbras nobreak 12/7 ( 1 ano garantia )","description":"Bateria Intelbras nobreak 12/7 ( 1 ano garantia )","type":"produto","unitPrice":150,"price":150,"amount":150,"quantity":1}]	574	80.00	150.00	[{"name":"Nobreak - Diagnóstico e resolução. Troca da bateria 12/7 nobreak + limpeza interna.","amount":80,"quantity":1,"type":"servico"}]	[{"name":"Bateria Intelbras nobreak 12/7 ( 1 ano garantia )","amount":150,"quantity":1,"type":"produto"}]	\N	\N	2026-01-13 03:00:00	\N	0.00	9
1217	Cartuchos impressora e ver notebook. 	107	280	entrada	0.00	pendente	\N	\N	2025-12-13 02:43:56.903	5	2025-12-13 02:43:56.919504	\N	\N	\N	\N	\N	\N	291	0.00	0.00	[{"name":"Cartuchos impressora e ver notebook. ","amount":0,"type":"servico"}]	[]	\N	\N	2025-12-13 02:43:56.919504	\N	0.00	5
1226	Notebook e inpraora pra verificar. 	169	251	entrada	150.00	pago	\N	2025-12-16 15:44:05.619	2025-12-16 15:43:51.878	9	2025-12-16 15:44:06.365	9	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Manutenção impressora Epson.: R$ 100,00\n- Ativação sistema windows e office. : R$ 50,00\n\n[{"name":"Manutenção impressora Epson.","description":"Manutenção impressora Epson.","type":"servico","unitPrice":100,"price":100,"amount":100,"quantity":1},{"name":"Ativação sistema windows e office. ","description":"Ativação sistema windows e office. ","type":"servico","unitPrice":50,"price":50,"amount":50,"quantity":1}]	534	150.00	0.00	[{"name":"Manutenção impressora Epson.","amount":100,"quantity":1,"type":"servico"},{"name":"Ativação sistema windows e office. ","amount":50,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-12-16 15:43:51.896679	\N	0.00	9
1235	Material em Tibau	\N	\N	saida	33.00	pago	\N	2025-12-20 03:00:00	2025-12-20 16:35:55.44	1	2025-12-20 16:35:55.720212	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-20 16:35:55.720212	\N	0.00	1
1239	Conclusão serviço Tibau	89	\N	entrada	534.00	pago	\N	2025-12-26 19:17:43.194	2025-12-22 13:42:55.553	9	2025-12-26 19:17:41.797	9	\N	\N	\N	\N	Conclusão serviço Tibau\n\nDiscriminação de valores:\n\nServiços:\n- Visita técnica adicional, Total de 3 visitas técnicas para puxar todos os cabos e instalar equipamentos e configurar sistemas e acessos. (Combustível para logistica incluso): R$ 350,00\n\nProdutos/Materiais:\n- Câmera IP POE Intelbras. Valor 250,00 - 150,00 já pago.: R$ 100,00\n- 3x Tomadas de rede RJ45 CAT6 com Caixas embutida, espelho e módulos. (R$ 28,00 cada): R$ 84,00\n\n[{"name":"Visita técnica adicional, Total de 3 visitas técnicas para puxar todos os cabos e instalar equipamentos e configurar sistemas e acessos. (Combustível para logistica incluso)","description":"Visita técnica adicional, Total de 3 visitas técnicas para puxar todos os cabos e instalar equipamentos e configurar sistemas e acessos. (Combustível para logistica incluso)","type":"servico","unitPrice":350,"price":350,"amount":350,"quantity":1},{"name":"Câmera IP POE Intelbras. Valor 250,00 - 150,00 já pago.","description":"Câmera IP POE Intelbras. Valor 250,00 - 150,00 já pago.","type":"produto","unitPrice":100,"price":100,"amount":100,"quantity":1},{"name":"Tomadas de rede RJ45 CAT6 com Caixas embutida, espelho e módulos.","description":"Tomadas de rede RJ45 CAT6 com Caixas embutida, espelho e módulos.","type":"produto","unitPrice":28,"price":84,"amount":84,"quantity":3}]	548	350.00	184.00	[{"name":"Visita técnica adicional, Total de 3 visitas técnicas para puxar todos os cabos e instalar equipamentos e configurar sistemas e acessos. (Combustível para logistica incluso)","amount":350,"quantity":1,"type":"servico"}]	[{"name":"Câmera IP POE Intelbras. Valor 250,00 - 150,00 já pago.","amount":100,"quantity":1,"type":"produto"},{"name":"Tomadas de rede RJ45 CAT6 com Caixas embutida, espelho e módulos.","amount":84,"quantity":3,"type":"produto"}]	\N	\N	2025-12-22 13:42:55.569544	\N	0.00	9
1242	Queda link	28	\N	entrada	100.00	pendente	\N	\N	2025-12-29 18:05:03.883	9	2025-12-29 18:05:03.903696	\N	\N	\N	\N	\N	Queda de link\n\nDiscriminação de valores:\n\nServiços:\n- Visita técnica para acompanhar equipe da Telecab na resolução do problema da queda do link.: R$ 100,00\n\n[{"name":"Visita técnica para acompanhar equipe da Telecab na resolução do problema da queda do link.","description":"Visita técnica para acompanhar equipe da Telecab na resolução do problema da queda do link.","type":"servico","unitPrice":100,"price":100,"amount":100,"quantity":1}]	554	100.00	0.00	[{"name":"Visita técnica para acompanhar equipe da Telecab na resolução do problema da queda do link.","amount":100,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-12-29 18:05:03.903696	\N	0.00	9
1243	Estabilizador Carliane Cia da fórmula	\N	\N	saida	80.00	pago	\N	2025-12-30 03:00:00	2025-12-30 10:44:37.897	1	2025-12-30 10:44:38.165472	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-30 10:44:38.165472	\N	0.00	1
1244	Verificar notebook 	176	276	entrada	300.00	pendente	\N	\N	2026-01-03 15:20:54.114	9	2026-01-03 15:20:54.131648	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Backup, Formatação, instalação, configuração e atualização do sistema e programas.  : R$ 150,00\n\nProdutos/Materiais:\n- Fonte Dell Pino fino 19v 3.42 Novo.: R$ 150,00\n- Bateria da placa mãe CMOS. ( Responsável por segurar configuração da placa mãe, data e horário.  : R$ 0,00\n\n[{"name":"Backup, Formatação, instalação, configuração e atualização do sistema e programas.  ","description":"Backup, Formatação, instalação, configuração e atualização do sistema e programas.  ","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1},{"name":"Fonte Dell Pino fino 19v 3.42 Novo.","description":"Fonte Dell Pino fino 19v 3.42 Novo.","type":"produto","unitPrice":150,"price":150,"amount":150,"quantity":1},{"name":"Bateria da placa mãe CMOS. ( Responsável por segurar configuração da placa mãe, data e horário.  ","description":"Bateria da placa mãe CMOS. ( Responsável por segurar configuração da placa mãe, data e horário.  ","type":"produto","unitPrice":0.0001,"price":0.0001,"amount":0.0001,"quantity":1}]	555	150.00	150.00	[{"name":"Backup, Formatação, instalação, configuração e atualização do sistema e programas.  ","amount":150,"quantity":1,"type":"servico"}]	[{"name":"Fonte Dell Pino fino 19v 3.42 Novo.","amount":150,"quantity":1,"type":"produto"},{"name":"Bateria da placa mãe CMOS. ( Responsável por segurar configuração da placa mãe, data e horário.  ","amount":0.0001,"quantity":1,"type":"produto"}]	\N	\N	2026-01-03 15:20:54.131648	\N	0.00	9
1248	Parcela 1 - Obra medical center. Desmontagem e passagem dos novos cabos para efetuar obra. Remontagem de equipamentos após obra. Só falta agora colocar as 4 câmeras pra funcionar. Foram usados 200 metros de cabo. 2 canaletas. 4 câmeras recepção e faixada.	28	105	entrada	519.60	pendente	2025-12-05 00:00:00	\N	2026-01-05 16:37:12.908	5	2026-01-05 16:37:12.927067	\N	\N	1203	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-05 16:37:12.927067	\N	0.00	5
1249	Parcela 2 - Obra medical center. Desmontagem e passagem dos novos cabos para efetuar obra. Remontagem de equipamentos após obra. Só falta agora colocar as 4 câmeras pra funcionar. Foram usados 200 metros de cabo. 2 canaletas. 4 câmeras recepção e faixada.	28	105	entrada	519.60	pendente	2026-01-05 00:00:00	\N	2026-01-05 16:37:14.447	5	2026-01-05 16:37:14.464976	\N	\N	1203	2	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-05 16:37:14.464976	\N	0.00	5
1250	Parcela 3 - Obra medical center. Desmontagem e passagem dos novos cabos para efetuar obra. Remontagem de equipamentos após obra. Só falta agora colocar as 4 câmeras pra funcionar. Foram usados 200 metros de cabo. 2 canaletas. 4 câmeras recepção e faixada.	28	105	entrada	519.60	pendente	2026-02-05 00:00:00	\N	2026-01-05 16:37:15.692	5	2026-01-05 16:37:15.708912	\N	\N	1203	3	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-05 16:37:15.708912	\N	0.00	5
1251	Parcela 4 - Obra medical center. Desmontagem e passagem dos novos cabos para efetuar obra. Remontagem de equipamentos após obra. Só falta agora colocar as 4 câmeras pra funcionar. Foram usados 200 metros de cabo. 2 canaletas. 4 câmeras recepção e faixada.	28	105	entrada	519.60	pendente	2026-03-05 00:00:00	\N	2026-01-05 16:37:16.902	5	2026-01-05 16:37:16.919429	\N	\N	1203	4	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-05 16:37:16.919429	\N	0.00	5
1252	Parcela 5 - Obra medical center. Desmontagem e passagem dos novos cabos para efetuar obra. Remontagem de equipamentos após obra. Só falta agora colocar as 4 câmeras pra funcionar. Foram usados 200 metros de cabo. 2 canaletas. 4 câmeras recepção e faixada.	28	105	entrada	519.60	pendente	2026-04-05 00:00:00	\N	2026-01-05 16:37:18.147	5	2026-01-05 16:37:18.163994	\N	\N	1203	5	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-05 16:37:18.163994	\N	0.00	5
1259	Material Abel gordinho construfat	\N	\N	saida	100.00	pago	\N	2026-01-13 02:43:26.232	2026-01-13 02:43:14.002	1	2026-01-13 02:43:26.316	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-13 02:43:14.272276	\N	0.00	1
1210	Visita técnica para organização dos equipamentos de rede no hack principal e ajustes na configuração do Mikrotik routerboard	134	100	entrada	250.00	pendente	\N	\N	2025-12-13 02:30:23.635	1	2025-12-13 02:30:23.652539	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Visita técnica para organização dos equipamentos de rede no hack principal: R$ 250,00\n\n[{"name":"Visita técnica para organização dos equipamentos de rede no hack principal","description":"Visita técnica para organização dos equipamentos de rede no hack principal","type":"servico","unitPrice":250,"price":250,"amount":250,"quantity":1}]	400	250.00	0.00	[{"name":"Visita técnica para organização dos equipamentos de rede no hack principal","amount":250,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-12-13 02:30:23.652539	\N	0.00	1
1236	11/12 penúltima parcela Forex	\N	\N	saida	475.00	pago	\N	2025-12-20 03:00:00	2025-12-20 16:36:29.881	1	2025-12-20 16:36:30.171521	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-20 16:36:30.171521	\N	0.00	1
1246	Aluguel de máquinas Tibau. 	178	281	entrada	2070.00	pendente	\N	\N	2026-01-04 00:41:01.103	9	2026-01-04 00:41:01.120269	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- ​Locação de infraestrutura de TI (2 Estações de Trabalho e 3 Impressoras Térmicas) com instalação de rede lógica e suporte técnico (30 dias). Inclui periféricos, switch e estabilizadores. Equipamentos sob responsabilidade do locatário quanto à conservação e integridade física.: R$ 2000,00\n\nProdutos/Materiais:\n- 20x Cabos de Rede Furukawa Cat5.e - Preto (R$ 3,50 cada): R$ 70,00\n\n[{"name":"​Locação de infraestrutura de TI (2 Estações de Trabalho e 3 Impressoras Térmicas) com instalação de rede lógica e suporte técnico (30 dias). Inclui periféricos, switch e estabilizadores. Equipamentos sob responsabilidade do locatário quanto à conservação e integridade física.","description":"​Locação de infraestrutura de TI (2 Estações de Trabalho e 3 Impressoras Térmicas) com instalação de rede lógica e suporte técnico (30 dias). Inclui periféricos, switch e estabilizadores. Equipamentos sob responsabilidade do locatário quanto à conservação e integridade física.","type":"servico","unitPrice":2000,"price":2000,"amount":2000,"quantity":1},{"name":"Cabos de Rede Furukawa Cat5.e - Preto","description":"Cabos de Rede Furukawa Cat5.e - Preto","type":"produto","unitPrice":3.5,"price":70,"amount":70,"quantity":20}]	556	2000.00	70.00	[{"name":"​Locação de infraestrutura de TI (2 Estações de Trabalho e 3 Impressoras Térmicas) com instalação de rede lógica e suporte técnico (30 dias). Inclui periféricos, switch e estabilizadores. Equipamentos sob responsabilidade do locatário quanto à conservação e integridade física.","amount":2000,"quantity":1,"type":"servico"}]	[{"name":"Cabos de Rede Furukawa Cat5.e - Preto","amount":70,"quantity":20,"type":"produto"}]	\N	\N	2026-01-04 00:41:01.120269	\N	0.00	9
453	CPU Jacinta sem conexão de internet	14	265	entrada	100.00	pago	\N	2026-01-05 17:33:59.199	2025-10-08 03:00:00	1	2026-01-05 17:33:59.495	1	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Visita técnica com ajustes na impressora nos computadores de Jacinta e Janaíne. Testes na conexão de rede e nas redes wi-fi.: R$ 80,00\n\n[{"name":"Visita técnica com ajustes na impressora nos computadores de Jacinta e Janaíne. Testes na conexão de rede e nas redes wi-fi.","description":"Visita técnica com ajustes na impressora nos computadores de Jacinta e Janaíne. Testes na conexão de rede e nas redes wi-fi.","type":"servico","unitPrice":80,"price":80,"amount":80,"quantity":1}]	287	80.00	0.00	[{"name":"Visita técnica com ajustes na impressora nos computadores de Jacinta e Janaíne. Testes na conexão de rede e nas redes wi-fi.","amount":80,"quantity":1,"type":"servico"}]	[]	\N	\N	2025-10-11 15:37:30.359966	\N	0.00	1
1261	Pegar note pra analisar.	3	\N	entrada	385.00	pendente	\N	\N	2026-01-13 13:32:31.559	9	2026-01-13 13:32:31.575105	\N	\N	\N	\N	\N	Pegar note pra analisar.\n\nDiscriminação de valores:\n\nServiços:\n- Manutenção corretiva e preventiva em notebook Sony Vaio. Diagnóstico, substituição de teclado e higienização interna técnica. : R$ 120,00\n\nProdutos/Materiais:\n- Teclado Para Notebook Sony Vaio S15 ( Fornecedor em Mossoró. Entregamos pronto na segunda.): R$ 265,00\n\n[{"name":"Manutenção corretiva e preventiva em notebook Sony Vaio. Diagnóstico, substituição de teclado e higienização interna técnica. ","description":"Manutenção corretiva e preventiva em notebook Sony Vaio. Diagnóstico, substituição de teclado e higienização interna técnica. ","type":"servico","unitPrice":120,"price":120,"amount":120,"quantity":1},{"name":"Teclado Para Notebook Sony Vaio S15 ( Fornecedor em Mossoró. Entregamos pronto na segunda.)","description":"Teclado Para Notebook Sony Vaio S15 ( Fornecedor em Mossoró. Entregamos pronto na segunda.)","type":"produto","unitPrice":265,"price":265,"amount":265,"quantity":1}]	571	120.00	265.00	[{"name":"Manutenção corretiva e preventiva em notebook Sony Vaio. Diagnóstico, substituição de teclado e higienização interna técnica. ","amount":120,"quantity":1,"type":"servico"}]	[{"name":"Teclado Para Notebook Sony Vaio S15 ( Fornecedor em Mossoró. Entregamos pronto na segunda.)","amount":265,"quantity":1,"type":"produto"}]	\N	\N	2026-01-13 13:32:31.575105	\N	0.00	9
1264	01/12 - Odete rotina de backups	8	\N	entrada	100.00	pendente	\N	\N	2025-12-01 03:00:00	9	2026-01-15 17:47:19.419	\N	\N	\N	\N	\N	Odete rotina de backups\n\nDiscriminação de valores:\n\nServiços:\n- ROTINA DE BACKUPS DOS BANCOS DE DADOS.: R$ 100,00\n\n[{"name":"ROTINA DE BACKUPS DOS BANCOS DE DADOS.","description":"ROTINA DE BACKUPS DOS BANCOS DE DADOS.","type":"servico","unitPrice":100,"price":100,"amount":100,"quantity":1}]	577	100.00	0.00	[{"name":"ROTINA DE BACKUPS DOS BANCOS DE DADOS.","amount":100,"quantity":1,"type":"servico"}]	[]	\N	\N	2026-01-14 11:35:08.148289	\N	0.00	9
1211	Trocar Dcjack e carregador. Reconstrução na carcaça e manutenção das dobradiças. 	62	220	entrada	235.00	pendente	\N	\N	2025-12-13 02:34:44.328	9	2025-12-13 02:34:44.345368	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- Serviço diagnóstico e reparo. Limpeza interna, desoxidação das placas, troca da pasta térmica. Troca do DCJack/conector carga. Reparo na carcaça e manutenção nas dobradiças.: R$ 150,00\n\nProdutos/Materiais:\n- Conector DCJack P/ Notebook Samsung: R$ 85,00\n\n[{"name":"Serviço diagnóstico e reparo. Limpeza interna, desoxidação das placas, troca da pasta térmica. Troca do DCJack/conector carga. Reparo na carcaça e manutenção nas dobradiças.","description":"Serviço diagnóstico e reparo. Limpeza interna, desoxidação das placas, troca da pasta térmica. Troca do DCJack/conector carga. Reparo na carcaça e manutenção nas dobradiças.","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1},{"name":"Conector DCJack P/ Notebook Samsung","description":"Conector DCJack P/ Notebook Samsung","type":"produto","unitPrice":85,"price":85,"amount":85,"quantity":1}]	512	150.00	85.00	[{"name":"Serviço diagnóstico e reparo. Limpeza interna, desoxidação das placas, troca da pasta térmica. Troca do DCJack/conector carga. Reparo na carcaça e manutenção nas dobradiças.","amount":150,"quantity":1,"type":"servico"}]	[{"name":"Conector DCJack P/ Notebook Samsung","amount":85,"quantity":1,"type":"produto"}]	\N	\N	2025-12-13 02:34:44.345368	\N	0.00	9
1237	6/12 parcela inicial sistema	\N	\N	saida	100.00	pago	\N	2025-12-20 03:00:00	2025-12-20 16:37:23.178	1	2025-12-20 16:37:23.439619	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-20 16:37:23.439619	\N	0.00	1
1241	Orçamento serviço casa da praia.	89	\N	entrada	7035.00	pago	\N	2025-12-26 19:17:35.289	2025-12-22 14:03:34.086	9	2025-12-26 19:17:34.196	9	\N	\N	\N	\N	Orçamento serviço casa da praia.\n\nDiscriminação de valores:\n\nServiços:\n- ​Serviço de análise, projeção e execução. ​Inclui instalação completa da infraestrutura de rede, passagem de cabos para todos os pontos, configuração do servidor DHCP para receber o link de internet e realizar a distribuição. Instalação e configuração de dois roteadores, sendo um no Térreo e outro no 1º andar. Sistema de CFTV: passagem de cabos das câmeras até o local do DVR, Instalação e configuração de 4 câmeras internas, DVR com HD para backup e acesso remoto para visualização. Finalizado com orientação de uso ao cliente.: R$ 2000,00\n- ​Logística Mossoró/Tibau 2 dias. Dois Técnicos.: R$ 120,00\n\nProdutos/Materiais:\n- ​Sistema CFTV Inclui: 4 Câmeras Intelbras VHC 1320C Bullet. DVR Intelbras MHDX 1304. S/ HD.: R$ 1250,00\n- HD SATA Seagate CFTV 2TB.: R$ 650,00\n- Fonte chaveada para alimentação do sistema de CFTV.: R$ 80,00\n- 4x Caixas VBOX para organizar conectores das câmeras no teto.  (R$ 16,25 cada): R$ 65,00\n- 4x Pares de Ballun. Conector de vídeo para as câmeras. (R$ 25,00 cada): R$ 100,00\n- 4x Conectores P4. Para alimentação das câmeras. (R$ 5,00 cada): R$ 20,00\n- 2x CX Cabos de rede CAT5.E 100% Cobre. (1 caixa para rede, 1 caixa para câmeras) (R$ 900,00 cada): R$ 1800,00\n- 2x Roteadores Intelbras W6 Giga para o Térreo e outro para 1°andar (R$ 350,00 cada): R$ 700,00\n- Switch Intelbras Giga 8P (Para fazer a distribuição da rede a cabo dentro da caixa de passagem dos cabos): R$ 250,00\n\n[{"name":"​Serviço de análise, projeção e execução. ​Inclui instalação completa da infraestrutura de rede, passagem de cabos para todos os pontos, configuração do servidor DHCP para receber o link de internet e realizar a distribuição. Instalação e configuração de dois roteadores, sendo um no Térreo e outro no 1º andar. Sistema de CFTV: passagem de cabos das câmeras até o local do DVR, Instalação e configuração de 4 câmeras internas, DVR com HD para backup e acesso remoto para visualização. Finalizado com orientação de uso ao cliente.","amount":2000,"quantity":1,"type":"servico"},{"name":"​Logística Mossoró/Tibau 2 dias. Dois Técnicos.","description":"​Logística Mossoró/Tibau 2 dias. Dois Técnicos.","type":"servico","unitPrice":120,"price":120,"amount":120,"quantity":1},{"name":"​Sistema CFTV Inclui: 4 Câmeras Intelbras VHC 1320C Bullet. DVR Intelbras MHDX 1304. S/ HD.","amount":1250,"quantity":1,"type":"produto"},{"name":"HD SATA Seagate CFTV 2TB.","amount":650,"quantity":1,"type":"produto"},{"name":"Fonte chaveada para alimentação do sistema de CFTV.","amount":80,"quantity":1,"type":"produto"},{"name":"Caixas VBOX para organizar conectores das câmeras no teto. ","amount":65,"quantity":4,"type":"produto"},{"name":"Pares de Ballun. Conector de vídeo para as câmeras.","amount":100,"quantity":4,"type":"produto"},{"name":"Conectores P4. Para alimentação das câmeras.","amount":20,"quantity":4,"type":"produto"},{"name":"CX Cabos de rede CAT5.E 100% Cobre. (1 caixa para rede, 1 caixa para câmeras)","amount":1800,"quantity":2,"type":"produto"},{"name":"Roteadores Intelbras W6 Giga para o Térreo e outro para 1°andar","amount":700,"quantity":2,"type":"produto"},{"name":"Switch Intelbras Giga 8P (Para fazer a distribuição da rede a cabo dentro da caixa de passagem dos cabos)","amount":250,"quantity":1,"type":"produto"}]	549	2120.00	4915.00	[{"name":"​Serviço de análise, projeção e execução. ​Inclui instalação completa da infraestrutura de rede, passagem de cabos para todos os pontos, configuração do servidor DHCP para receber o link de internet e realizar a distribuição. Instalação e configuração de dois roteadores, sendo um no Térreo e outro no 1º andar. Sistema de CFTV: passagem de cabos das câmeras até o local do DVR, Instalação e configuração de 4 câmeras internas, DVR com HD para backup e acesso remoto para visualização. Finalizado com orientação de uso ao cliente.","amount":2000,"quantity":1,"type":"servico"},{"name":"​Logística Mossoró/Tibau 2 dias. Dois Técnicos.","amount":120,"quantity":1,"type":"servico"}]	[{"name":"​Sistema CFTV Inclui: 4 Câmeras Intelbras VHC 1320C Bullet. DVR Intelbras MHDX 1304. S/ HD.","amount":1250,"quantity":1,"type":"produto"},{"name":"HD SATA Seagate CFTV 2TB.","amount":650,"quantity":1,"type":"produto"},{"name":"Fonte chaveada para alimentação do sistema de CFTV.","amount":80,"quantity":1,"type":"produto"},{"name":"Caixas VBOX para organizar conectores das câmeras no teto. ","amount":65,"quantity":4,"type":"produto"},{"name":"Pares de Ballun. Conector de vídeo para as câmeras.","amount":100,"quantity":4,"type":"produto"},{"name":"Conectores P4. Para alimentação das câmeras.","amount":20,"quantity":4,"type":"produto"},{"name":"CX Cabos de rede CAT5.E 100% Cobre. (1 caixa para rede, 1 caixa para câmeras)","amount":1800,"quantity":2,"type":"produto"},{"name":"Roteadores Intelbras W6 Giga para o Térreo e outro para 1°andar","amount":700,"quantity":2,"type":"produto"},{"name":"Switch Intelbras Giga 8P (Para fazer a distribuição da rede a cabo dentro da caixa de passagem dos cabos)","amount":250,"quantity":1,"type":"produto"}]	\N	\N	2025-12-22 14:03:34.103004	\N	0.00	9
1247	Dr Otávio Casa da Praia.	114	\N	entrada	550.00	pendente	\N	\N	2026-01-04 00:50:58.883	9	2026-01-04 00:50:58.900185	\N	\N	\N	\N	\N	Dr Otávio Casa da Praia.\n\nDiscriminação de valores:\n\nServiços:\n- Visita técnica casa de Tibau - ​Instalação e configuração de roteador Wi-Fi com parametrização de conectividade em Smart TVs (1º andar).: R$ 200,00\n\nProdutos/Materiais:\n- ​Roteador Wi-Fi 6 Intelbras Force W6-1000 Giga.: R$ 350,00\n\n[{"name":"Visita técnica casa de Tibau - ​Instalação e configuração de roteador Wi-Fi com parametrização de conectividade em Smart TVs (1º andar).","description":"Visita técnica casa de Tibau - ​Instalação e configuração de roteador Wi-Fi com parametrização de conectividade em Smart TVs (1º andar).","type":"servico","unitPrice":200,"price":200,"amount":200,"quantity":1},{"name":"​Roteador Wi-Fi 6 Intelbras Force W6-1000 Giga.","amount":350,"quantity":1,"type":"produto"}]	562	200.00	350.00	[{"name":"Visita técnica casa de Tibau - ​Instalação e configuração de roteador Wi-Fi com parametrização de conectividade em Smart TVs (1º andar).","amount":200,"quantity":1,"type":"servico"}]	[{"name":"​Roteador Wi-Fi 6 Intelbras Force W6-1000 Giga.","amount":350,"quantity":1,"type":"produto"}]	\N	\N	2026-01-04 00:50:58.900185	\N	0.00	9
1253	Manutenção nos três computadores do escritório	31	273	entrada	1910.00	pendente	\N	\N	2026-01-05 18:06:39.273	1	2026-01-05 18:19:35.556	\N	\N	\N	\N	\N	Discriminação de valores:\n\nServiços:\n- 3x Instalação Windows 11 pro + atualizações e pacote de programas (R$ 150,00 cada): R$ 450,00\n- Backup completo de todos os aquivos das três máquinas do escritório: R$ 100,00\n\nProdutos/Materiais:\n- SSD 480gb WD: R$ 450,00\n- SSD 128gb WD: R$ 160,00\n- CPU Dell Optiplex 3010 : R$ 750,00\n\n[{"name":"SSD 480gb WD","description":"SSD 480gb WD","type":"produto","unitPrice":450,"price":450,"amount":450,"quantity":1},{"name":"SSD 128gb WD","description":"SSD 128gb WD","type":"produto","unitPrice":160,"price":160,"amount":160,"quantity":1},{"name":"Instalação Windows 11 pro + atualizações e pacote de programas","description":"Instalação Windows 11 pro + atualizações e pacote de programas","type":"servico","unitPrice":150,"price":450,"amount":450,"quantity":3},{"name":"CPU Dell Optiplex 3010 ","description":"CPU Dell Optiplex 3010 ","type":"produto","unitPrice":750,"price":750,"amount":750,"quantity":1},{"name":"Backup completo de todos os aquivos das três máquinas do escritório","description":"Backup completo de todos os aquivos das três máquinas do escritório","type":"servico","unitPrice":100,"price":100,"amount":100,"quantity":1}]	559	550.00	1360.00	[{"name":"Instalação Windows 11 pro + atualizações e pacote de programas","amount":450,"quantity":3,"type":"servico"},{"name":"Backup completo de todos os aquivos das três máquinas do escritório","amount":100,"quantity":1,"type":"servico"}]	[{"name":"SSD 480gb WD","amount":450,"quantity":1,"type":"produto"},{"name":"SSD 128gb WD","amount":160,"quantity":1,"type":"produto"},{"name":"CPU Dell Optiplex 3010 ","amount":750,"quantity":1,"type":"produto"}]	\N	\N	2026-01-05 18:06:39.290611	\N	0.00	1
1262	Config Roteador	124	\N	entrada	80.00	pendente	\N	\N	2026-01-13 14:49:18.829	9	2026-01-13 14:49:41.161	\N	\N	\N	\N	\N	Config Roteador\n\nDiscriminação de valores:\n\nServiços:\n- Visita técnica para configurar e ajustar ligações do roteador. : R$ 100,00\n\n[{"name":"Visita técnica para configurar e ajustar ligações do roteador. ","description":"Visita técnica para configurar e ajustar ligações do roteador. ","type":"servico","unitPrice":100,"price":100,"amount":100,"quantity":1}]\n\n--- DESCONTO APLICADO ---\nValor original: R$ 100,00\nDesconto: R$ 20,00\nValor final: R$ 80,00	572	100.00	0.00	[{"name":"Visita técnica para configurar e ajustar ligações do roteador. ","amount":100,"quantity":1,"type":"servico"}]	[]	\N	\N	2026-01-13 14:49:18.846824	100.00	20.00	9
1263	Sama Nobreak	134	\N	entrada	380.00	pendente	\N	\N	2026-01-14 11:21:19.827	9	2026-01-14 11:21:19.843313	\N	\N	\N	\N	\N	Sama Nobreak. \n\nDiscriminação de valores:\n\nServiços:\n- Diagnóstico e resolução. Troca das baterias + limpeza interna. : R$ 80,00\n\nProdutos/Materiais:\n- 2x Baterias P/ Nobreak Intelbras 12v7a. (R$ 150,00 cada): R$ 300,00\n\n[{"name":"Diagnóstico e resolução. Troca das baterias + limpeza interna. ","description":"Diagnóstico e resolução. Troca das baterias + limpeza interna. ","type":"servico","unitPrice":80,"price":80,"amount":80,"quantity":1},{"name":"Baterias P/ Nobreak Intelbras 12v7a.","description":"Baterias P/ Nobreak Intelbras 12v7a.","type":"produto","unitPrice":150,"price":300,"amount":300,"quantity":2}]	576	80.00	300.00	[{"name":"Diagnóstico e resolução. Troca das baterias + limpeza interna. ","amount":80,"quantity":1,"type":"servico"}]	[{"name":"Baterias P/ Nobreak Intelbras 12v7a.","amount":300,"quantity":2,"type":"produto"}]	\N	\N	2026-01-14 11:21:19.843313	\N	0.00	9
1265	12/12 a 16/12 - Análise Link problema wpp	8	\N	entrada	150.00	pendente	\N	\N	2025-12-15 03:00:00	9	2026-01-15 17:46:45.71	\N	\N	\N	\N	\N	Análise Link problema wpp\n\nDiscriminação de valores:\n\nServiços:\n- Análise na infra estrutura para tentar identificar problemas, devido a lentidão na aplicação do Wpp. Foi feito diversas análises, testes e mudanças no modo de operação, usando link 1 e link 2. Porém nada foi contatado de erro na infra estrutura de rede interna. O problema estava relacionado a link e aplicação.: R$ 150,00\n\n[{"name":"Análise na infra estrutura para tentar identificar problemas, devido a lentidão na aplicação do Wpp. Foi feito diversas análises, testes e mudanças no modo de operação, usando link 1 e link 2. Porém nada foi contatado de erro na infra estrutura de rede interna. O problema estava relacionado a link e aplicação.","description":"Análise na infra estrutura para tentar identificar problemas, devido a lentidão na aplicação do Wpp. Foi feito diversas análises, testes e mudanças no modo de operação, usando link 1 e link 2. Porém nada foi contatado de erro na infra estrutura de rede interna. O problema estava relacionado a link e aplicação.","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1}]	578	150.00	0.00	[{"name":"Análise na infra estrutura para tentar identificar problemas, devido a lentidão na aplicação do Wpp. Foi feito diversas análises, testes e mudanças no modo de operação, usando link 1 e link 2. Porém nada foi contatado de erro na infra estrutura de rede interna. O problema estava relacionado a link e aplicação.","amount":150,"quantity":1,"type":"servico"}]	[]	\N	\N	2026-01-14 11:42:12.47049	\N	0.00	9
\.


--
-- Data for Name: history_events; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.history_events (id, call_id, service_id, transaction_id, event_type, description, user_id, metadata, created_at) FROM stdin;
1	270	\N	\N	call_created	Chamado criado: 	1	\N	2025-10-08 16:24:43.370927
2	\N	276	\N	service_created	Serviço criado: bjjhghjgh	1	\N	2025-10-08 16:24:53.173243
3	\N	276	433	invoiced	Transação faturada: bjjhghjgh	1	\N	2025-10-08 16:25:11.960873
4	\N	276	433	payment_received	Pagamento recebido: bjjhghjgh	1	\N	2025-10-08 16:25:48.347521
5	271	\N	\N	call_created	Chamado criado: 	1	\N	2025-10-08 16:28:40.214765
6	\N	277	\N	service_created	Serviço criado: asddaste teste test	1	\N	2025-10-08 16:39:43.834147
7	\N	277	434	invoiced	Transação faturada: asddaste teste test	1	\N	2025-10-08 16:40:25.485394
8	\N	277	434	payment_received	Pagamento recebido: asddaste teste test	1	\N	2025-10-08 16:40:45.979003
9	272	\N	\N	call_created	Chamado criado: 	1	\N	2025-10-08 16:48:48.187111
10	\N	278	\N	service_created	Serviço criado: sdasdasdasdasdaasdsdasdasda	1	\N	2025-10-08 16:48:58.500348
11	\N	278	435	invoiced	Transação faturada: sdasdasdasdasdaasdsdasdasda	1	\N	2025-10-08 16:49:25.235458
12	\N	278	435	payment_received	Pagamento recebido: sdasdasdasdasdaasdsdasdasda	1	\N	2025-10-08 16:49:48.850026
13	\N	279	\N	service_created	Serviço criado: sdasdasdasdasdaasdsdasdasda	1	\N	2025-10-08 16:57:29.345
14	273	\N	\N	call_created	Chamado criado: 	1	\N	2025-10-08 16:57:58.323
15	273	280	\N	converted_to_service	Chamado convertido em serviço: bjhjhkjhjhgjhgjhg	1	\N	2025-10-08 16:58:04.233
16	273	280	436	invoiced	Transação faturada: bjhjhkjhjhgjhgjhg	1	\N	2025-10-08 16:58:04.233
17	273	280	436	payment_received	Pagamento recebido: bjhjhkjhjhgjhgjhg	1	\N	2025-10-08 16:58:44.169
18	274	\N	\N	call_created	Chamado criado: 	1	\N	2025-10-08 17:00:22.471
19	274	281	\N	converted_to_service	Chamado convertido em serviço: sdasdsdasdasda	1	\N	2025-10-08 17:00:26.177
20	275	\N	\N	call_created	Chamado criado: 	1	\N	2025-10-08 17:07:49.049
21	275	282	\N	converted_to_service	Chamado convertido em serviço: sdadasdasdasdasd	1	\N	2025-10-08 17:07:50.362
22	275	282	437	invoiced	Transação faturada: sdadasdasdasdasd	1	\N	2025-10-08 17:07:50.362
23	275	282	437	payment_received	Pagamento recebido: sdadasdasdasdasd	1	\N	2025-10-08 17:08:29.65
24	276	\N	\N	call_created	Chamado criado: 	1	\N	2025-10-08 17:14:03.956
25	276	283	\N	converted_to_service	Chamado convertido em serviço: sadasdasdasdasdasd	1	\N	2025-10-08 17:14:05.44
26	276	283	438	invoiced	Transação faturada: sadasdasdasdasdasd	1	\N	2025-10-08 17:14:05.44
27	276	283	438	payment_received	Pagamento recebido: sadasdasdasdasdasd	1	\N	2025-10-08 17:15:07.209
28	\N	271	426	payment_received	Pagamento recebido: Monitor Dell 19" setor RH Saul	1	\N	2025-10-08 17:32:26.161
29	277	\N	\N	call_created	Chamado criado: 	1	\N	2025-10-08 17:37:09.183
30	277	284	\N	converted_to_service	Chamado convertido em serviço: Teste parcelamento 	1	\N	2025-10-08 17:37:18.205
31	277	284	439	invoiced	Transação faturada: Teste parcelamento 	1	\N	2025-10-08 17:37:18.205
32	278	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-08 19:23:13.689
33	267	285	\N	converted_to_service	Chamado convertido em serviço: CPU para analisar sistema tela azul e redistribuição de partições	1	\N	2025-10-08 23:00:42.151
34	\N	286	\N	service_created	Serviço criado: Ajustes CPU Dra Isabelli que estava com erro na impressora, substituição bateria CMOS CPU coleta, ajustes na CPU raio-x (garantia)	1	\N	2025-10-08 23:03:02.703
35	\N	286	440	invoiced	Transação faturada: Ajustes CPU Dra Isabelli que estava com erro na impressora, substituição bateria CMOS CPU coleta, ajustes na CPU raio-x (garantia)	1	\N	2025-10-08 23:03:02.703
36	265	287	\N	converted_to_service	Chamado convertido em serviço: CPU Jacinta sem conexão de internet	1	\N	2025-10-08 23:04:51.045
37	241	288	\N	converted_to_service	Chamado convertido em serviço: Levar switch 8 portas para instalar na empresa	1	\N	2025-10-08 23:05:06.648
38	\N	\N	441	payment_received	Pagamento de parcela recebido: Parcela 4 - Parcelamento avulso materiais e serviços 	1	\N	2025-10-09 13:43:06.737
39	\N	188	244	payment_received	Pagamento recebido: Manutenção de computadores, impressora e rede.\n\nDiscriminação de valores:\n\nServiços:\n- Backup, instalação Windows 10 pro com pacote de programas e atualizações computador balcão: R$ 150,00\n- Backup, instalação Windows 10 pro com pacote de programas e atualizações computador que veio de Natal: R$ 150,00\n- Manutenção impressora Epson com reparo na cabeça de impressão: R$ 150,00\n- Ajustes na configuração da rede e da impressora da recepção e compartilhamento da impressora para todas as máquinas.: R$ 100,00\n\n[{"name":"Backup, instalação Windows 10 pro com pacote de programas e atualizações computador balcão","description":"Backup, instalação Windows 10 pro com pacote de programas e atualizações computador balcão","type":"servico","price":150,"amount":150,"quantity":1},{"name":"Backup, instalação Windows 10 pro com pacote de programas e atualizações computador que veio de Natal","description":"Backup, instalação Windows 10 pro com pacote de programas e atualizações computador que veio de Natal","type":"servico","price":150,"amount":150,"quantity":1},{"name":"Manutenção impressora Epson com reparo na cabeça de impressão","description":"Manutenção impressora Epson com reparo na cabeça de impressão","type":"servico","price":150,"amount":150,"quantity":1},{"name":"Ajustes na configuração da rede e da impressora da recepção e compartilhamento da impressora para todas as máquinas.","description":"Ajustes na configuração da rede e da impressora da recepção e compartilhamento da impressora para todas as máquinas.","type":"servico","price":100,"amount":100,"quantity":1}]	1	\N	2025-10-09 13:44:20.592
40	\N	250	420	payment_received	Pagamento recebido: Reparo na impressora m1120 do faturamento e criação de contas de e-mail para a diretoria	1	\N	2025-10-09 13:44:53.751
41	\N	\N	442	payment_received	Pagamento recebido: Andrew Cell frp bypass Cel e tablet Stive	1	\N	2025-10-09 13:49:28.16
42	\N	\N	443	payment_received	Pagamento recebido: 9/12 parcela Forex 	1	\N	2025-10-09 13:50:02.274
43	\N	\N	444	payment_received	Pagamento recebido: Mensalidade do sistema 	1	\N	2025-10-09 13:50:19.561
44	\N	\N	445	payment_received	Pagamento recebido: 4/12 sistema inicial 	1	\N	2025-10-09 13:50:39.225
45	\N	\N	446	payment_received	Pagamento recebido: 2/3 rolo de fibra óptica	1	\N	2025-10-09 13:51:13.986
46	\N	\N	447	payment_received	Pagamento recebido: Kalione restam 600	1	\N	2025-10-09 13:51:33.981
47	\N	\N	448	invoiced	Transação faturada: Afra Matias	1	\N	2025-10-09 13:53:24.067
48	\N	\N	448	payment_received	Pagamento recebido: Afra Matias	1	\N	2025-10-09 13:53:59.346
49	\N	\N	449	invoiced	Transação faturada: Afra Matias	1	\N	2025-10-09 13:55:27.843
50	\N	\N	449	payment_received	Pagamento recebido: Afra Matias	1	\N	2025-10-09 13:55:42.039
51	\N	\N	450	payment_received	Pagamento recebido: Kalione restam 400	1	\N	2025-10-09 22:17:38.419
52	\N	\N	451	payment_received	Pagamento recebido: Estabilizador torre 500 va Kalione	1	\N	2025-10-09 22:18:05.933
53	279	\N	\N	call_created	Chamado criado: 	1	\N	2025-10-10 14:35:10
54	279	289	\N	converted_to_service	Chamado convertido em serviço: CPU não liga, apitando.	1	\N	2025-10-11 13:42:43.442
55	279	289	452	invoiced	Transação faturada: Computador não inicializa	1	\N	2025-10-11 03:00:00
56	265	287	453	invoiced	Transação faturada: CPU Jacinta sem conexão de internet	1	\N	2025-10-08 23:04:51.045
57	279	289	452	payment_received	Pagamento recebido: Computador não inicializa	1	\N	2025-10-11 15:37:39.919
58	\N	\N	454	payment_received	Pagamento recebido: Kalione restam 300	1	\N	2025-10-11 15:38:08.217
59	\N	\N	455	invoiced	Transação faturada: Baixa com backup + adaptador áudio P2 USB 	1	\N	2025-10-14 18:13:37.208
60	\N	\N	455	payment_received	Pagamento recebido: Baixa com backup + adaptador áudio P2 USB 	1	\N	2025-10-14 18:13:45.286
61	280	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-15 11:30:39.016
62	281	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-15 12:51:33.289
63	\N	252	456	invoiced	Transação faturada: Medical Center – Impressora/Scanner Wi-Fi HP seminovo. Instalação e configuração na rede sem fio, permitindo o uso das funções de digitalização a partir das duas máquinas da recepção.	5	\N	2025-09-22 03:00:00
64	282	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-15 16:02:12.954
65	281	290	\N	converted_to_service	Chamado convertido em serviço: Pc TeleAtendimento não liga e está cheirando a queimado. \nTroca da alimentação queimada. Efetuada a troca da fonte. 	5	\N	2025-10-15 16:06:08.955
66	281	290	457	invoiced	Transação faturada: Pc TeleAtendimento não liga e está cheirando a queimado. \nTroca da alimentação queimada. Efetuada a troca da fonte. 	5	\N	2025-10-15 16:06:08.955
67	267	285	458	invoiced	Transação faturada: CPU para analisar sistema tela azul e redistribuição de partições	1	\N	2025-10-08 23:00:42.151
68	267	285	458	payment_received	Pagamento recebido: CPU para analisar sistema tela azul e redistribuição de partições	1	\N	2025-10-16 02:20:56.672
69	\N	\N	459	invoiced	Transação faturada: Teste	1	\N	2025-10-16 02:22:59.538
70	\N	\N	460	payment_received	Pagamento recebido: Parcela 1/2 - Teste	1	\N	2025-10-16 13:11:21.075
71	\N	206	277	payment_received	Pagamento recebido: Ajustes no sistema de câmeras, CPU jornalismo e...\n\nDiscriminação de valores:\n\nServiços:\n- Reparo na tomada de rede do roteador AduernSede4: R$ 50,00\n- Reparo no sistema operacional CPU jornalismo e atualizações do sistema: R$ 100,00\n- Visita técnica para ajustes no sistema de câmeras e substituição da fonte de alimentação. Na ocasião, o sistema não estava gravando e foi feito um ajuste no sistema do DVR e a reposição da fonte.: R$ 100,00\n- Mudança do local do roteador AduernSede3 (roteador do salão de eventos): R$ 150,00\n- Visita técnica para instalação do novo nobreak no sistema de câmeras e rede: R$ 100,00\n\nProdutos/Materiais:\n- Fonte de alimentação para o DVR (sistema de câmeras): R$ 80,00\n- Cabo de rede RJ 45 5 mts: R$ 25,00\n- Visita técnica para ajustes na rede e mudanças nos roteadores: R$ 100,00\n- No break Intelbras Attiv 700 VA: R$ 600,00\n\n[{"name":"Reparo na tomada de rede do roteador AduernSede4","amount":50,"type":"servico"},{"name":"Reparo no sistema operacional CPU jornalismo e atualizações do sistema","amount":100,"type":"servico"},{"name":"Visita técnica para ajustes no sistema de câmeras e substituição da fonte de alimentação. Na ocasião, o sistema não estava gravando e foi feito um ajuste no sistema do DVR e a reposição da fonte.","amount":100,"type":"servico"},{"name":"Fonte de alimentação para o DVR (sistema de câmeras)","amount":80,"type":"produto"},{"name":"Cabo de rede RJ 45 5 mts","amount":25,"type":"produto"},{"name":"Visita técnica para ajustes na rede e mudanças nos roteadores","amount":100,"type":"produto"},{"name":"Mudança do local do roteador AduernSede3 (roteador do salão de eventos)","description":"Mudança do local do roteador AduernSede3 (roteador do salão de eventos)","type":"servico","price":150,"amount":150,"quantity":1},{"name":"No break Intelbras Attiv 700 VA","description":"No break Intelbras Attiv 700 VA","type":"produto","price":600,"amount":600,"quantity":1},{"name":"Visita técnica para instalação do novo nobreak no sistema de câmeras e rede","description":"Visita técnica para instalação do novo nobreak no sistema de câmeras e rede","type":"servico","price":100,"amount":100,"quantity":1}]	1	\N	2025-10-16 13:27:53.93
72	\N	\N	462	payment_received	Pagamento recebido: Conectores de vídeo balun	1	\N	2025-10-16 18:09:37.593
73	\N	\N	463	payment_received	Pagamento recebido: Salão Jovem	1	\N	2025-10-16 22:36:29.021
74	280	291	\N	converted_to_service	Chamado convertido em serviço: Cartuchos impressora e ver notebook. 	5	\N	2025-10-17 12:36:17.924
75	283	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-17 12:36:59.679
76	\N	292	\N	service_created	Serviço criado: Parcela 3/5 - Manutenção preventiva de todas as máquinas das 3 lojas.	5	\N	2025-10-17 13:36:41.112
77	\N	293	\N	service_created	Serviço criado: Parcela 3/5 - Manutenção preventiva de todas as máquinas das 3 lojas.	5	\N	2025-09-10 03:00:00
78	\N	\N	464	invoiced	Transação faturada: Parcela 3/5 - Manutenção preventiva de todas as máquinas das 3 lojas.	5	\N	2025-10-17 13:39:37.646
79	\N	\N	465	invoiced	Transação faturada: Parcela 3/5 - Desktop completo para recepção João da Escóssia.	5	\N	2025-10-17 13:40:28.777
80	\N	\N	466	invoiced	Transação faturada: Parcela 3/5 - Roteador Intelbras configurado com a rede clientes na João da Escóssia. Discriminação de valores: Produtos/Materiais: - Roteador Intelbras configurado com a rede clientes na João da Escóssia.	5	\N	2025-10-17 13:41:15.832
81	\N	\N	467	payment_received	Pagamento recebido: Almoço amigas pós afim 	1	\N	2025-10-17 17:18:09.583
82	284	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-17 17:22:51.123
83	285	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-17 17:23:20.308
84	286	\N	\N	call_created	Chamado criado: 	1	\N	2025-10-20 16:10:24.009
85	287	\N	\N	call_created	Chamado criado: 	1	\N	2025-10-20 16:10:48.758
86	286	294	\N	converted_to_service	Chamado convertido em serviço: Notebook com erro na inicialização do Windows	1	\N	2025-10-20 16:10:57.166
87	284	295	\N	converted_to_service	Chamado convertido em serviço: Reparo carcaça e dobradiças. 	5	\N	2025-10-20 16:11:01.503
88	288	\N	\N	call_created	Chamado criado: 	1	\N	2025-10-08 03:00:00
89	288	296	\N	converted_to_service	Chamado convertido em serviço: 8/10 Visita técnica para ajustes no raio x, recepção e impressora Dra Isabelli 	1	\N	2025-10-21 10:48:56.908
90	287	297	\N	converted_to_service	Chamado convertido em serviço: Impressora recepção com atolamento de papel	1	\N	2025-10-21 10:48:59.845
91	283	298	\N	converted_to_service	Chamado convertido em serviço: Verificar etiquetadora zebra do lab Rafaela. 	5	\N	2025-10-21 10:49:04.808
92	264	299	\N	converted_to_service	Chamado convertido em serviço: Substituição do roteador	1	\N	2025-10-21 10:49:16.716
93	289	\N	\N	call_created	Chamado criado: 	1	\N	2025-10-21 11:05:05.163
94	290	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-21 12:02:28.202
95	291	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-21 12:04:00.768
96	292	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-21 13:32:18.35
97	287	297	468	invoiced	Transação faturada: Impressora recepção com atolamento de papel	1	\N	2025-10-21 10:48:59.845
98	288	296	469	invoiced	Transação faturada: Visita técnica para ajustes no raio x, recepção e impressora Dra Isabelli 	1	\N	2025-10-21 03:00:00
99	293	\N	\N	call_created	Chamado criado: 	1	\N	2025-10-22 03:00:00
100	261	300	\N	converted_to_service	Chamado convertido em serviço: CPU do carrinho com problemas e impressora do balcão apresentando atolamento de papel	1	\N	2025-10-21 17:35:12.327
101	292	301	\N	converted_to_service	Chamado convertido em serviço: Brother digitação dcp 8512dn. Reposicao de toner e cilindro. 	5	\N	2025-10-22 04:13:51.1
102	290	302	\N	converted_to_service	Chamado convertido em serviço: Foi desativado a bateria que estava causando falhas ao funcionamento da máquina.	5	\N	2025-10-22 04:14:59.205
103	285	303	\N	converted_to_service	Chamado convertido em serviço: Filtro de linha desligado. Apenas aperta um botão.	5	\N	2025-10-22 04:15:43.032
153	312	316	\N	converted_to_service	Chamado convertido em serviço: Manutenção Projetores Multimídia.	5	\N	2025-10-29 16:12:11.988
104	289	304	\N	converted_to_service	Chamado convertido em serviço: Ligar máquina no teleatendimento e trazer um estabilizador para reparo	1	\N	2025-10-22 04:17:02.23
105	294	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-22 04:17:52.052
106	295	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-22 04:18:58.949
107	252	305	\N	converted_to_service	Chamado convertido em serviço: Digitação, Impressora Hp P1102, efetuado a troca do rolete tracionador de papel. 	5	\N	2025-10-22 04:21:02.32
108	296	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-22 04:23:04.78
109	296	306	\N	converted_to_service	Chamado convertido em serviço: Digitação, Impressora Brother DCP 1617NW, troca do DR/Cilindro. 	5	\N	2025-10-22 04:23:32.16
110	292	301	470	invoiced	Transação faturada: Brother digitação dcp 8512dn. Reposicao de toner e cilindro. 	5	\N	2025-10-22 04:13:51.1
111	290	302	471	invoiced	Transação faturada: Foi desativado a bateria que estava causando falhas ao funcionamento da máquina.	5	\N	2025-10-22 04:14:59.205
112	289	304	472	invoiced	Transação faturada: Ligar máquina no teleatendimento e trazer um estabilizador para reparo	1	\N	2025-10-22 04:17:02.23
113	285	303	473	invoiced	Transação faturada: Filtro de linha desligado. Apenas aperta um botão.	5	\N	2025-10-22 04:15:43.032
114	283	298	474	invoiced	Transação faturada: Verificar etiquetadora zebra do lab Rafaela. 	5	\N	2025-10-21 10:49:04.808
115	252	305	475	invoiced	Transação faturada: Digitação, Impressora Hp P1102, efetuado a troca do rolete tracionador de papel. 	5	\N	2025-10-22 04:21:02.32
116	296	306	476	invoiced	Transação faturada: Digitação, Impressora Brother DCP 1617NW, troca do DR/Cilindro. 	5	\N	2025-09-25 03:00:00
117	\N	238	477	invoiced	Transação faturada: Acesso remoto para resolver problema no pacote office notebook Alvanize. 	5	\N	2025-09-10 18:47:18.5
118	\N	239	478	invoiced	Transação faturada: Visita técnica para localizar e refazer conectores do cabo de rede setor Almoxarifado, Ana Paula. 	5	\N	2025-09-10 03:00:00
119	285	303	473	payment_received	Pagamento recebido: Filtro de linha desligado. Apenas aperta um botão.	5	\N	2025-10-22 04:29:57.593
120	286	294	479	invoiced	Transação faturada: Notebook com erro na inicialização do Windows	1	\N	2025-10-20 16:10:57.166
121	286	294	479	payment_received	Pagamento recebido: Notebook com erro na inicialização do Windows	1	\N	2025-10-22 16:29:17.222
122	297	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-13 03:00:00
123	297	307	\N	converted_to_service	Chamado convertido em serviço: Visita técnica de manhã e a tarde em conjunto com alguns acessos remotos para identificar problema na internet da escola. Constatamos que era um problema no link. Em contatos com a Interjato empresa responsável pelos links, conseguimos trocar para um segundo link da escola. 	5	\N	2025-10-22 18:32:49.011
124	297	307	480	invoiced	Transação faturada: Visita técnica de manhã e a tarde em conjunto com alguns acessos remotos para identificar problema na internet da escola. Constatamos que era um problema no link. Em contatos com a Interjato empresa responsável pelos links, conseguimos trocar para um segundo link da escola. 	5	\N	2025-10-22 18:32:49.011
125	298	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-22 20:21:58.758
126	299	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-23 03:52:43.105
127	295	308	\N	converted_to_service	Chamado convertido em serviço: Visita técnica antiga policlínica para analisar e passar orçamento de serviço para instalar e configurar estrutura de rede e computadores . 	5	\N	2025-10-23 16:12:27.586
128	300	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-24 12:51:46.589
129	299	309	\N	converted_to_service	Chamado convertido em serviço: Pegar máquina no escritório e levar para instalar na casa dele. 	5	\N	2025-10-24 13:00:05.738
130	299	309	481	invoiced	Transação faturada: Pegar máquina no escritório e levar para instalar na casa dele. 	5	\N	2025-10-24 13:00:05.738
131	301	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-27 12:28:41.443
132	302	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-27 12:29:40.877
133	303	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-27 13:33:50.852
134	304	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-28 13:59:17.202
135	305	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-29 13:01:24.947
136	305	310	\N	converted_to_service	Chamado convertido em serviço: Epson L3150 - Manutenção preventiva e corretiva. Limpeza interna e lubrificação. Desentupimento da cabeça de impressão, remoção do ar das tubulações.	5	\N	2025-10-29 13:01:36.509
137	306	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-29 13:01:55.699
138	306	311	\N	converted_to_service	Chamado convertido em serviço: Epson L355 - Manutenção preventiva e corretiva. Limpeza interna e lubrificação. Desentupimento da cabeça de impressão, remoção do ar das tubulações.	5	\N	2025-10-29 13:02:03.206
139	305	310	482	invoiced	Transação faturada: Epson L3150 - Manutenção preventiva e corretiva. Limpeza interna e lubrificação. Desentupimento da cabeça de impressão, remoção do ar das tubulações.	5	\N	2025-10-29 13:01:36.509
140	306	311	483	invoiced	Transação faturada: Epson L355 - Manutenção preventiva e corretiva. Limpeza interna e lubrificação. Desentupimento da cabeça de impressão, remoção do ar das tubulações.	5	\N	2025-10-29 13:02:03.206
141	307	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-29 13:08:14.433
142	\N	312	\N	service_created	Serviço criado: Epson L355 - Manutenção preventiva e corretiva. Limpeza interna e lubrificação. Desentupimento da cabeça de impressão, remoção do ar das tubulações.	5	\N	2025-10-29 13:10:11.169
143	\N	312	484	invoiced	Transação faturada: Epson L355 - Manutenção preventiva e corretiva. Limpeza interna e lubrificação. Desentupimento da cabeça de impressão, remoção do ar das tubulações.	5	\N	2025-10-29 13:10:11.169
144	308	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-29 13:37:27.912
145	309	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-29 15:26:31.619
146	310	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-29 15:27:12.01
147	304	313	\N	converted_to_service	Chamado convertido em serviço: Visita técnica para instalar memória de 8gb	5	\N	2025-10-29 15:43:40.523
148	311	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-29 15:55:17.862
149	311	314	\N	converted_to_service	Chamado convertido em serviço: Memória Kingston DDR3 8GB 1600GHz\nVisita técnica para instalação de memória RAM emd desktop.	5	\N	2025-10-29 15:55:59.19
150	311	314	485	invoiced	Transação faturada: Memória Kingston DDR3 8GB 1600GHz\nVisita técnica para instalação de memória RAM emd desktop.	5	\N	2025-10-29 15:55:59.19
151	254	315	\N	converted_to_service	Chamado convertido em serviço: Instalar e configurar StarLink	5	\N	2025-10-29 16:11:36.535
152	312	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-29 16:12:06.901
154	254	315	486	invoiced	Transação faturada: Instalar e configurar StarLink	5	\N	2025-10-29 16:11:36.535
155	313	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-30 14:49:54.637
156	309	317	\N	converted_to_service	Chamado convertido em serviço: Impressora entupida. 	5	\N	2025-10-30 14:50:27.844
157	314	\N	\N	call_created	Chamado criado: 	1	\N	2025-10-30 20:03:46.727
158	314	318	\N	converted_to_service	Chamado convertido em serviço: Telefones com problemas de conexão	1	\N	2025-10-30 20:03:51.339
159	314	318	487	invoiced	Transação faturada: Telefones com problemas de conexão	1	\N	2025-10-30 20:03:51.339
160	315	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-31 14:00:40.507
161	315	319	\N	converted_to_service	Chamado convertido em serviço: Reinstalação do pacote office e ajustes no sistema operacional. Pc Lucinete. 	5	\N	2025-10-31 14:00:44.402
162	315	319	488	invoiced	Transação faturada: Reinstalação do pacote office e ajustes no sistema operacional. Pc Lucinete. 	5	\N	2025-10-06 03:00:00
163	316	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-31 14:05:01.974
164	309	317	489	invoiced	Transação faturada: Impressora entupida. 	5	\N	2025-10-30 14:50:27.844
165	284	295	490	invoiced	Transação faturada: Reparo carcaça e dobradiças SSD 240 + baixa	5	\N	2025-10-20 03:00:00
166	298	320	\N	converted_to_service	Chamado convertido em serviço: Verificar lentidão na impressão. 	5	\N	2025-10-31 14:13:41.608
167	298	320	491	invoiced	Transação faturada: Verificar lentidão na impressão. 	5	\N	2025-10-31 14:13:41.608
168	317	\N	\N	call_created	Chamado criado: 	5	\N	2025-04-05 03:00:00
169	317	321	\N	converted_to_service	Chamado convertido em serviço: Valor referente a notas passadas. 	5	\N	2025-10-31 14:36:01.931
170	318	\N	\N	call_created	Chamado criado: 	5	\N	2025-05-05 03:00:00
171	318	322	\N	converted_to_service	Chamado convertido em serviço: Desktop - Limpeza interna, desoxidação nas placas e troca da pasta térmica. Ajustes no sistema operacional. 	5	\N	2025-10-31 14:39:14.123
172	319	\N	\N	call_created	Chamado criado: 	5	\N	2025-05-05 03:00:00
173	319	323	\N	converted_to_service	Chamado convertido em serviço: Impressora Epson L5190 - Manutenção, limpeza interna, lubrificação, desentupimento da tubulação e cabeça de impressão, troca das almofadas do descarte e reset. 	5	\N	2025-10-31 14:40:36.225
174	320	\N	\N	call_created	Chamado criado: 	5	\N	2025-06-05 03:00:00
175	320	324	\N	converted_to_service	Chamado convertido em serviço: Manutenção preventiva desktop - Limpeza interna, desoxidação das placas e troca da pasta térmica. Testes. 	5	\N	2025-10-31 15:12:05.777
176	321	\N	\N	call_created	Chamado criado: 	5	\N	2025-07-17 03:00:00
177	321	325	\N	converted_to_service	Chamado convertido em serviço: Impressora Epson L5190 - retorno impressora falhando. Nova manutenção. Resolvido. Não gerou custo. 	5	\N	2025-10-31 15:18:21.134
178	322	\N	\N	call_created	Chamado criado: 	5	\N	2025-07-24 03:00:00
179	322	326	\N	converted_to_service	Chamado convertido em serviço: Desktop para copiar arquivos e enviar para Jéssica.	5	\N	2025-10-31 15:19:47.183
180	323	\N	\N	call_created	Chamado criado: 	5	\N	2025-07-22 03:00:00
181	323	327	\N	converted_to_service	Chamado convertido em serviço: Manutenção geral em impressora grande porte. Limpeza interna e lubrificação, manutenção na unidade de fusão, manutenção sistema do scaner e troca da lâmpada. Troca do toner e DR. 	5	\N	2025-10-31 15:36:42.132
182	317	321	492	invoiced	Transação faturada: Valor referente a notas passadas. 	5	\N	2025-04-07 03:00:00
183	318	322	493	invoiced	Transação faturada: Desktop - Limpeza interna, desoxidação nas placas e troca da pasta térmica. Ajustes no sistema operacional. 	5	\N	2025-05-05 03:00:00
184	319	323	494	invoiced	Transação faturada: Impressora Epson L5190 - Manutenção, limpeza interna, lubrificação, desentupimento da tubulação e cabeça de impressão, troca das almofadas do descarte e reset. 	5	\N	2025-05-05 03:00:00
185	320	324	495	invoiced	Transação faturada: Manutenção preventiva desktop - Limpeza interna, desoxidação das placas e troca da pasta térmica. Testes. 	5	\N	2025-06-05 03:00:00
186	323	327	496	invoiced	Transação faturada: Manutenção geral em impressora grande porte. Limpeza interna e lubrificação, manutenção na unidade de fusão, manutenção sistema do scaner e troca da lâmpada. Troca do toner e DR. 	5	\N	2025-07-23 03:00:00
187	321	325	497	invoiced	Transação faturada: Impressora Epson L5190 - retorno impressora falhando. Nova manutenção. Resolvido. Não gerou custo. 	5	\N	2025-07-23 03:00:00
188	322	326	498	invoiced	Transação faturada: Desktop para copiar arquivos e enviar para Jéssica.	5	\N	2025-08-01 03:00:00
189	324	\N	\N	call_created	Chamado criado: 	5	\N	2025-08-18 03:00:00
190	324	328	\N	converted_to_service	Chamado convertido em serviço: Impressora Epson L5190 - retorno. Impressora falhando. Troca da tubulação velha causando entupimento. Não gerou custo. 	5	\N	2025-10-31 15:54:19.865
191	324	328	499	invoiced	Transação faturada: Impressora Epson L5190 - retorno. Impressora falhando. Troca da tubulação velha causando entupimento. Não gerou custo. 	5	\N	2025-08-21 03:00:00
192	325	\N	\N	call_created	Chamado criado: 	5	\N	2025-08-18 03:00:00
193	325	329	\N	converted_to_service	Chamado convertido em serviço: Impressora Epson L555 - manutenção preventiva, limpeza interna, lubrificação, desentupimento da cabeça de impressão e tubulação, troca das almofadas e reset. 	5	\N	2025-10-31 15:56:20.635
194	325	329	500	invoiced	Transação faturada: Impressora Epson L555 - manutenção preventiva, limpeza interna, lubrificação, desentupimento da cabeça de impressão e tubulação, troca das almofadas e reset. 	5	\N	2025-08-21 03:00:00
195	326	\N	\N	call_created	Chamado criado: 	5	\N	2025-08-18 03:00:00
196	326	330	\N	converted_to_service	Chamado convertido em serviço: Manutenção Desktop - limpeza interna e desoxidação das memórias. 	5	\N	2025-10-31 15:58:28.954
197	326	330	501	invoiced	Transação faturada: Manutenção Desktop - limpeza interna e desoxidação das memórias. 	5	\N	2025-08-21 03:00:00
198	327	\N	\N	call_created	Chamado criado: 	5	\N	2025-08-18 03:00:00
199	327	331	\N	converted_to_service	Chamado convertido em serviço: 3 estabilizadora para reparo. Apenas um teve reparo. Reparo na placa com troca de componentes. 	5	\N	2025-10-31 16:01:02.704
200	327	331	502	invoiced	Transação faturada: 3 estabilizadora para reparo. Apenas um teve reparo. Reparo na placa com troca de componentes. 	5	\N	2025-09-22 03:00:00
201	\N	\N	503	invoiced	Transação faturada: Pc Lenovo para Alan do Rock na presença	1	\N	2025-11-03 11:18:04.568
202	\N	\N	503	payment_received	Pagamento recebido: Pc Lenovo para Alan do Rock na presença	1	\N	2025-11-03 11:18:51.864
203	316	332	\N	converted_to_service	Chamado convertido em serviço: Trocar rolete do tracionador da Hp LaserJet P1102W	5	\N	2025-11-03 12:49:52.222
204	\N	\N	504	invoiced	Transação faturada: Nota Dr Sérgio serviços sistema antigo	1	\N	2025-11-03 17:25:07.822
205	\N	\N	504	payment_received	Pagamento recebido: Nota Dr Sérgio serviços sistema antigo	1	\N	2025-11-03 17:25:16.378
206	328	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-04 13:58:33.887
207	329	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-04 13:59:26.865
208	330	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-04 14:00:59.588
209	314	318	487	payment_received	Pagamento recebido: Telefones com problemas de conexão	1	\N	2025-11-04 15:53:06.118
210	331	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-04 18:17:11.314
211	332	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-04 18:23:13.29
212	333	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-04 18:29:29.942
213	334	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-05 02:44:34.076
214	334	333	\N	converted_to_service	Chamado convertido em serviço: Manutenção Epson L395, limpeza interna e desentupimento da cabeça de impressão e tubulações de tinta. 	5	\N	2025-11-05 02:45:21.574
215	334	333	505	invoiced	Transação faturada: Manutenção Epson L395, limpeza interna e desentupimento da cabeça de impressão e tubulações de tinta. 	5	\N	2025-08-20 03:00:00
216	316	332	506	invoiced	Transação faturada: Trocar rolete do tracionador da Hp LaserJet P1102W	5	\N	2025-11-03 12:49:52.222
217	335	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-23 03:00:00
218	335	334	\N	converted_to_service	Chamado convertido em serviço: Impressora Epson L555. Diagnóstico e resolução. Correira o cara de impressão partida. Resolução. \nLimpeza interna e lubrificação, troca da correia do carro de impressão, manutenção cabeça de impressão. 	5	\N	2025-11-05 03:35:41.137
219	335	334	507	invoiced	Transação faturada: Impressora Epson L555. Diagnóstico e resolução. Correira o cara de impressão partida. Resolução. \nLimpeza interna e lubrificação, troca da correia do carro de impressão, manutenção cabeça de impressão. 	5	\N	2025-10-23 03:00:00
220	336	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-23 03:00:00
221	336	335	\N	converted_to_service	Chamado convertido em serviço: Manutenção geral em impressora grande porte. Limpeza interna e lubrificação, manutenção na unidade de fusão, manutenção sistema do scaner e troca da lâmpada. Troca do toner e DR.	5	\N	2025-11-05 03:38:12.908
222	336	335	508	invoiced	Transação faturada: Manutenção geral em impressora grande porte. Limpeza interna e lubrificação, manutenção na unidade de fusão, manutenção sistema do scaner e troca da lâmpada. Troca do toner e DR.	5	\N	2025-10-23 03:00:00
223	\N	336	\N	service_created	Serviço criado: Manutenção na cabeça de impressão 	7	\N	2025-11-05 03:00:00
224	337	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-06 11:13:28.936
225	337	337	\N	converted_to_service	Chamado convertido em serviço: Visita técnica para reset e reconfiguração de todas as antenas/access points Unifi da pousada, devido à perda do servidor anterior. O serviço demandará um dia ou mais para conclusão.	5	\N	2025-11-06 11:13:33.408
226	\N	\N	509	invoiced	Transação faturada: Suporte remoto para ajustes na configuração do acesso ao sistema de câmeras e gravações.	1	\N	2025-11-06 13:35:34.63
227	307	338	\N	converted_to_service	Chamado convertido em serviço: Visita técnica para analisar estabilizador. .	5	\N	2025-11-07 13:05:35.472
228	307	338	510	invoiced	Transação faturada: Visita técnica para analisar estabilizador. .	5	\N	2025-11-07 13:05:35.472
229	338	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-07 13:13:20.135
230	338	339	\N	converted_to_service	Chamado convertido em serviço: Serviço de configuração e parametrização dos backups automáticos para a nuvem Google Driver. 	5	\N	2025-11-07 13:13:26.588
231	339	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-07 15:34:00.29
232	340	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-10 12:20:41.978
233	341	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-11 14:04:38.182
234	342	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-11 17:42:16.61
235	342	340	\N	converted_to_service	Chamado convertido em serviço: Manutenção impressora Brother DCP-L5502DN SN: U64189G1N680228.  Manutenção Sistema cópia/scaner. Com troca do encoder. Troca do Toner e DR/Cilindro.	5	\N	2025-11-11 17:42:21.253
236	342	340	511	invoiced	Transação faturada: Manutenção impressora Brother DCP-L5502DN SN: U64189G1N680228.  Manutenção Sistema cópia/scaner. Com troca do encoder. Troca do Toner e DR/Cilindro.	5	\N	2025-11-11 17:42:21.253
237	343	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-20 03:00:00
238	344	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-11 18:57:56.724
239	344	341	\N	converted_to_service	Chamado convertido em serviço: Manutenção dobradiças e reparo carcaça. 	5	\N	2025-11-11 18:57:59.265
240	345	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-01 03:00:00
241	345	342	\N	converted_to_service	Chamado convertido em serviço: ROTINA DE BACKUP DOS BANCO DE DADOS.	5	\N	2025-11-11 19:46:24.753
242	345	342	512	invoiced	Transação faturada: ROTINA DE BACKUP DOS BANCO DE DADOS.	5	\N	2025-10-01 03:00:00
243	\N	343	\N	service_created	Serviço criado: Ajustes nos sistemas de câmeras de Upanema e Mossoró	1	\N	2025-11-11 23:07:11.804
244	\N	343	513	invoiced	Transação faturada: Ajustes nos sistemas de câmeras de Upanema e Mossoró	1	\N	2025-11-11 23:07:11.804
245	241	288	514	invoiced	Transação faturada: Ajustes na estrutura de rede e instalação de switch 8 portas giga	1	\N	2025-10-08 03:00:00
246	346	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-12 11:35:47.522
247	347	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-12 11:37:50.416
248	348	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-12 16:28:10.301
249	349	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-12 16:28:50.961
250	313	344	\N	converted_to_service	Chamado convertido em serviço: Pegar impressora p1102 que não liga...	5	\N	2025-11-13 11:29:22.205
251	341	345	\N	converted_to_service	Chamado convertido em serviço: Impressora Dr Dirceu. 	5	\N	2025-11-13 11:29:55.77
252	\N	346	\N	service_created	Serviço criado: Serviço de reparo impressora HP LaserJet P1102w. Troca do rolete do tracionador do papel. Serviço + peça. 	5	\N	2025-10-31 03:00:00
253	350	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-31 03:00:00
254	350	347	\N	converted_to_service	Chamado convertido em serviço: Serviço reparo impressora HP LaserJet P1102w recepção. Troca do rolete do tracionador do papel. Serviço + peça. 	5	\N	2025-11-13 11:35:19.694
255	350	347	515	invoiced	Transação faturada: Serviço reparo impressora HP LaserJet P1102w recepção. Troca do rolete do tracionador do papel. Serviço + peça. 	5	\N	2025-10-31 03:00:00
322	\N	401	1005	invoiced	Transação faturada: Manutenção na cabeça de impressão	1	\N	2025-11-22 16:01:58.645
256	341	345	516	invoiced	Transação faturada: Serviço de Manutenção impressora Epson L3250 - Consultório Dr. Dirceu. Limpeza interna, lubrificação, troca das almofadas do descarte e reset. Peça + Serviço.	5	\N	2025-11-11 03:00:00
257	351	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-13 03:00:00
258	352	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-13 12:56:10.986
259	353	\N	\N	call_created	Chamado criado: 	5	\N	2025-10-01 03:00:00
260	353	348	\N	converted_to_service	Chamado convertido em serviço: ROTINA DE BACKUP DOS BANCO DE DADOS.	5	\N	2025-11-13 14:16:51.968
261	293	349	\N	converted_to_service	Chamado convertido em serviço: Computador da sala 4 está muito lento. Ver a possibilidade de upgrade ou substituição da máquina.	1	\N	2025-11-13 14:23:38.07
262	293	349	517	invoiced	Transação faturada: Computador da sala 4 está muito lento. Ver a possibilidade de upgrade ou substituição da máquina. Coringa Avançado ajustado para o consultório.  Formatação e reinstalação do sistema operacional.	1	\N	2025-10-31 03:00:00
263	354	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-22 03:00:00
264	340	350	\N	converted_to_service	Chamado convertido em serviço: Pc recepção do Detran perto de morrer. Pegar máquina para análise.	1	\N	2025-11-13 18:49:24.964
265	\N	351	\N	service_created	Serviço criado: Reparo no no-break do alarme e internet	1	\N	2025-11-13 18:50:24.07
266	\N	352	\N	service_created	Serviço criado: teste	1	\N	2025-11-13 19:12:21.597
267	\N	353	\N	service_created	Serviço criado: Reparo cameras teste	1	\N	2025-11-13 19:13:21.004
268	\N	354	\N	service_created	Serviço criado: Teste	1	\N	2025-11-13 19:14:12.196
269	\N	355	\N	service_created	Serviço criado: teste	1	\N	2025-11-13 19:14:35.956
270	\N	356	\N	service_created	Serviço criado: teste	1	\N	2025-11-13 19:15:41.428
271	355	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-14 11:54:16.627
272	356	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-14 11:54:40.355
273	357	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-18 12:58:26.396
274	358	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-18 13:51:23.611
275	359	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-18 13:53:14.047
276	359	357	\N	converted_to_service	Chamado convertido em serviço: Notebook para fazer manutenção.	5	\N	2025-11-18 13:53:39.631
277	346	358	\N	converted_to_service	Chamado convertido em serviço: Verificar barulho máquina Alcimar. 	5	\N	2025-11-19 13:48:52.886
278	331	359	\N	converted_to_service	Chamado convertido em serviço: Verificar Pc na loja. ..	5	\N	2025-11-19 17:31:23.901
279	360	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-19 17:32:36.069
280	\N	\N	518	payment_received	Pagamento recebido: Almoço amigas pos cia da fórmula	1	\N	2025-11-22 00:23:03.725
281	\N	\N	519	payment_received	Pagamento recebido: teste parcelamento de saidas	1	\N	2025-11-22 00:43:34.019
282	\N	\N	520	payment_received	Pagamento recebido: teste parcelamento de saidas	1	\N	2025-11-22 00:46:24.603
283	\N	\N	521	invoiced	Transação faturada: teste parcelamento de saidas	1	\N	2025-11-22 00:49:47.793
284	\N	\N	522	payment_received	Pagamento de parcela recebido: Parcela 1 - teste parcelamento de saidas	1	\N	2025-11-22 00:52:40.721
285	\N	\N	518	payment_received	Pagamento recebido: Almoço amigas pos cia da fórmula	1	\N	2025-11-22 00:53:35.023
286	\N	\N	523	invoiced	Transação faturada: teste parcelamento	1	\N	2025-11-22 00:55:24.856
287	\N	\N	524	payment_received	Pagamento de parcela recebido: Parcela 1 - teste parcelamento	1	\N	2025-11-22 00:55:41.434
288	\N	\N	525	invoiced	Transação faturada: parcelamentos	1	\N	2025-11-22 00:59:56.271
289	\N	\N	526	invoiced	Transação faturada: testa 	1	\N	2025-11-22 01:01:17.833
290	\N	\N	530	invoiced	Transação faturada: teste parcelamento	1	\N	2025-11-22 01:04:18.956
291	\N	\N	531	payment_received	Pagamento recebido: Parcela 1 - teste parcelamento	1	\N	2025-11-22 01:11:06.127
292	338	339	534	invoiced	Transação faturada: Serviço de configuração e parametrização dos backups automáticos para a nuvem Google Driver. 	5	\N	2025-11-07 13:13:26.588
293	\N	336	535	invoiced	Transação faturada: Manutenção na cabeça de impressão 	7	\N	2025-11-05 03:00:00
294	\N	351	536	invoiced	Transação faturada: Reparo no no-break do alarme e internet	1	\N	2025-11-13 18:50:24.07
295	264	299	537	invoiced	Transação faturada: Substituição do roteador	1	\N	2025-10-21 10:49:16.716
296	3	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-22 12:47:48.414
297	100	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-21 03:00:00
298	100	400	\N	converted_to_service	Chamado convertido em serviço: Visita técnica para organização dos equipamentos de rede no hack principal e ajustes na configuração do Mikrotik routerboard	1	\N	2025-11-22 13:11:34.478
299	\N	\N	1000	payment_received	Pagamento recebido: Parcela 1 - Manutenção na cabeça de impressão 	1	\N	2025-11-22 13:26:07.509
300	\N	\N	1001	payment_received	Pagamento recebido: Parcela 1 - Manutenção na cabeça de impressão 	1	\N	2025-11-22 13:38:25.157
301	\N	\N	1002	payment_received	Pagamento recebido: Parcela 2 - Manutenção na cabeça de impressão 	1	\N	2025-11-22 13:39:13.181
302	\N	\N	1003	invoiced	Transação faturada: teste	1	\N	2025-11-22 14:08:33.416
303	\N	\N	1003	payment_received	Pagamento recebido: teste	1	\N	2025-11-22 14:14:30.64
304	\N	\N	1004	payment_received	Pagamento recebido: Parcela 1 - Manutenção na cabeça de impressão 	1	\N	2025-11-22 14:19:44.631
305	101	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-14 03:00:00
306	102	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-19 03:00:00
307	103	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-07 03:00:00
308	104	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-12 03:00:00
309	105	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-20 03:00:00
310	106	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-04 03:00:00
311	107	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-04 03:00:00
312	108	\N	\N	call_created	Chamado criado: 	1	\N	2025-10-27 03:00:00
313	109	\N	\N	call_created	Chamado criado: 	1	\N	2025-10-29 03:00:00
314	110	\N	\N	call_created	Chamado criado: 	1	\N	2025-10-27 03:00:00
315	111	\N	\N	call_created	Chamado criado: 	1	\N	2025-09-30 03:00:00
316	112	\N	\N	call_created	Chamado criado: 	1	\N	2025-08-22 03:00:00
317	113	\N	\N	call_created	Chamado criado: 	1	\N	2025-08-15 03:00:00
318	114	\N	\N	call_created	Chamado criado: 	1	\N	2025-06-13 03:00:00
319	115	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-04 03:00:00
320	116	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-01 03:00:00
321	\N	401	\N	service_created	Serviço criado: Manutenção na cabeça de impressão	1	\N	2025-11-22 16:01:58.645
396	134	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 15:46:18.076
323	\N	402	\N	service_created	Serviço criado: Manutenção na cabeça de impressão	1	\N	2025-11-22 16:31:44.988
324	\N	133	1006	invoiced	Transação faturada: Impressora de fotos imprime até metade	1	\N	2025-07-30 03:00:00
325	\N	403	\N	service_created	Serviço criado: Reparo no no-break do alarme e internet	1	\N	2025-11-22 17:46:00.146
326	\N	404	\N	service_created	Serviço criado: Manutenção impressora Recepção	5	\N	2025-11-20 03:00:00
327	\N	404	1007	invoiced	Transação faturada: Manutenção impressora Recepção	5	\N	2025-11-20 03:00:00
328	117	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-22 18:23:47.736
329	117	405	\N	converted_to_service	Chamado convertido em serviço: Teste	1	\N	2025-11-22 18:23:52.562
330	117	405	1008	invoiced	Transação faturada: Teste	1	\N	2025-11-22 18:23:52.562
331	\N	\N	1011	invoiced	Transação faturada: Teste	1	\N	2025-11-22 18:26:00.795
332	\N	406	\N	service_created	Serviço criado: Serviço de configuração e parametrização dos backups automáticos para a nuvem Google Driver.	5	\N	2025-11-22 20:57:39.885
333	\N	\N	1014	invoiced	Transação faturada: Escada parcelada em 14x de 52,93	5	\N	2025-11-22 21:08:26.002
334	\N	407	\N	service_created	Serviço criado: Manutenção impressora Recepção	5	\N	2025-11-22 21:10:27.618
335	\N	407	1015	invoiced	Transação faturada: Manutenção impressora Recepção	5	\N	2025-11-22 21:10:27.618
336	\N	\N	1016	invoiced	Transação faturada: Escada da assistência 	1	\N	2025-11-22 21:37:06.086
337	\N	\N	1019	payment_received	Pagamento recebido: Parcela 3 - Escada da assistência 	1	\N	2025-11-22 21:39:38.021
338	\N	\N	1031	invoiced	Transação faturada: Escada assistência teste	1	\N	2025-11-22 21:41:13.774
339	118	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 01:32:21.447
340	118	408	\N	converted_to_service	Chamado convertido em serviço: teste	1	\N	2025-11-23 01:32:33.219
341	118	408	1060	invoiced	Transação faturada: teste	1	\N	2025-11-23 01:32:33.219
342	\N	409	\N	service_created	Serviço criado: teste	1	\N	2025-11-23 01:38:11.104
343	\N	409	1061	invoiced	Transação faturada: teste	1	\N	2025-11-23 01:38:11.104
344	\N	410	\N	service_created	Serviço criado: teste	1	\N	2025-11-23 01:46:59.524
345	\N	410	1062	invoiced	Transação faturada: teste	1	\N	2025-11-23 01:46:59.524
346	\N	411	\N	service_created	Serviço criado: teste	1	\N	2025-11-23 01:50:42.908
347	\N	411	1063	invoiced	Transação faturada: teste	1	\N	2025-11-23 01:50:42.908
348	\N	412	\N	service_created	Serviço criado: teste	1	\N	2025-11-23 01:51:34.628
349	\N	412	1064	invoiced	Transação faturada: teste	1	\N	2025-11-23 01:51:34.628
350	\N	413	\N	service_created	Serviço criado: teste	1	\N	2025-11-23 01:53:42.604
351	119	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-22 03:00:00
352	119	414	\N	converted_to_service	Chamado convertido em serviço: teste	1	\N	2025-11-23 01:55:44.821
353	119	414	1065	invoiced	Transação faturada: teste	1	\N	2025-11-23 01:55:44.821
354	120	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 02:01:10.768
355	120	415	\N	converted_to_service	Chamado convertido em serviço: teste	1	\N	2025-11-23 02:01:17.636
356	\N	413	1066	invoiced	Transação faturada: teste	1	\N	2025-11-23 01:53:42.604
357	120	415	1067	invoiced	Transação faturada: teste	1	\N	2025-11-23 02:01:17.636
358	121	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 02:17:34.815
359	121	416	\N	converted_to_service	Chamado convertido em serviço: teste	1	\N	2025-11-23 02:17:39.965
360	121	416	1068	invoiced	Transação faturada: testes	1	\N	2025-11-23 02:18:03.661
361	122	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 02:20:38.983
362	122	417	\N	converted_to_service	Chamado convertido em serviço: tests	1	\N	2025-11-23 02:20:42.589
363	122	417	1069	invoiced	Transação faturada: tests	1	\N	2025-11-23 02:22:03.853
364	123	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 02:23:52.06
365	123	418	\N	converted_to_service	Chamado convertido em serviço: testes	1	\N	2025-11-23 02:23:56.204
366	123	418	1070	invoiced	Transação faturada: testes	1	\N	2025-11-23 02:24:05.795
367	\N	419	\N	service_created	Serviço criado: testes	1	\N	2025-11-23 02:24:44.381
368	\N	419	1071	invoiced	Transação faturada: testes	1	\N	2025-11-23 02:25:02.955
369	124	\N	\N	call_created	Chamado criado: 	7	\N	2025-11-23 12:34:06.331
370	124	420	\N	converted_to_service	Chamado convertido em serviço: Teste	7	\N	2025-11-23 12:34:42.414
371	124	420	1072	invoiced	Transação faturada: Teste	7	\N	2025-11-23 12:35:08.267
372	125	\N	\N	call_created	Chamado criado: 	7	\N	2025-11-23 12:40:42.346
373	125	421	\N	converted_to_service	Chamado convertido em serviço: Testes	7	\N	2025-11-23 12:41:27.257
374	126	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 12:57:03.821
375	\N	\N	1073	invoiced	Transação faturada: Teste	1	\N	2025-11-23 13:18:52.83
376	\N	\N	1073	payment_received	Pagamento recebido: Teste	1	\N	2025-11-23 13:19:51.937
377	127	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 14:52:26.177
378	128	\N	\N	call_created	Chamado criado: 	7	\N	2025-11-23 03:00:00
379	129	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 15:28:38.752
380	129	\N	\N	call_created	Chamado #129 criado	1	{"callId":129,"equipment":""}	2025-11-23 15:28:40.501794
381	129	422	\N	converted_to_service	Chamado convertido em serviço: Testes 	1	\N	2025-11-23 15:29:01.207
382	129	\N	\N	call_updated	Chamado #129 atualizado	1	{"callId":129}	2025-11-23 15:29:02.462266
383	130	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 15:33:08.763
384	130	\N	\N	call_created	Chamado #130 criado	1	{"callId":130,"equipment":""}	2025-11-23 15:33:10.176043
385	130	423	\N	converted_to_service	Chamado convertido em serviço: Testes	1	\N	2025-11-23 15:33:30.188
386	130	\N	\N	call_updated	Chamado #130 atualizado	1	{"callId":130}	2025-11-23 15:33:31.3222
387	131	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 15:36:53.431
388	131	\N	\N	call_created	Chamado #131 criado	1	{"callId":131,"equipment":""}	2025-11-23 15:36:54.748646
389	131	424	\N	converted_to_service	Chamado convertido em serviço: Testes	1	\N	2025-11-23 15:37:13.913
390	131	\N	\N	call_updated	Chamado #131 atualizado	1	{"callId":131}	2025-11-23 15:37:15.062951
391	132	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 15:41:35.188
392	132	\N	\N	call_created	Chamado #132 criado	1	{"callId":132,"equipment":""}	2025-11-23 15:41:36.510233
393	132	425	\N	converted_to_service	Chamado convertido em serviço: Testes	1	\N	2025-11-23 15:41:52.389
394	133	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 15:43:04.155
395	133	\N	\N	call_created	Chamado #133 criado	1	{"callId":133,"equipment":""}	2025-11-23 15:43:05.596217
397	134	426	\N	converted_to_service	Chamado convertido em serviço: Testes novamente 	1	\N	2025-11-23 15:46:32.311
398	134	426	1074	invoiced	Transação faturada: Testes novamente 	1	\N	2025-11-23 15:46:52.421
399	134	426	\N	service_deleted	Serviço #426 deletado	1	{"serviceId":426}	2025-11-23 15:46:54.72766
400	133	\N	\N	call_deleted	Chamado #133 deletado	1	{"callId":133}	2025-11-23 15:51:56.633592
401	135	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 15:52:21.323
402	135	427	\N	converted_to_service	Chamado convertido em serviço: Testes	1	\N	2025-11-23 15:52:37.233
403	135	427	1075	converted_to_financial	Serviço convertido para faturamento: Testes	1	\N	2025-11-23 15:52:53.989
404	135	427	\N	service_deleted	Serviço #427 deletado	1	{"serviceId":427}	2025-11-23 15:52:55.63538
405	136	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 15:56:35.322
406	136	\N	\N	call_deleted	Chamado #136 deletado	1	{"callId":136}	2025-11-23 15:56:42.411035
407	137	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 15:56:56.243
408	137	428	\N	converted_to_service	Chamado convertido em serviço: Nskskskdjdj	1	\N	2025-11-23 15:57:04.87
409	137	428	\N	service_updated	Serviço #428 atualizado	1	{"serviceId":428}	2025-11-23 15:57:41.823321
410	137	428	1076	converted_to_financial	Serviço convertido para faturamento: Nskskskdjdj	1	\N	2025-11-23 16:01:06.374
411	137	428	\N	service_deleted	Serviço #428 deletado	1	{"serviceId":428}	2025-11-23 16:01:08.142081
412	132	425	1077	converted_to_financial	Serviço convertido para faturamento: Testes	1	\N	2025-11-23 16:03:55.583
413	132	425	\N	service_deleted	Serviço #425 deletado	1	{"serviceId":425}	2025-11-23 16:03:57.275756
414	132	425	1077	transaction_deleted	Transação #1077 deletada - R$ 666.00	1	{"transactionId":1077,"amount":"666.00"}	2025-11-23 16:04:26.160474
415	137	428	1076	transaction_deleted	Transação #1076 deletada - R$ 100.00	1	{"transactionId":1076,"amount":"100.00"}	2025-11-23 16:04:59.332932
416	135	427	1075	transaction_deleted	Transação #1075 deletada - R$ 2000.00	1	{"transactionId":1075,"amount":"2000.00"}	2025-11-23 16:05:19.403218
417	134	426	1074	transaction_deleted	Transação #1074 deletada - R$ 200.00	1	{"transactionId":1074,"amount":"200.00"}	2025-11-23 16:05:25.76866
418	131	424	\N	service_deleted	Serviço #424 deletado	1	{"serviceId":424}	2025-11-23 16:05:36.845435
419	130	423	\N	service_deleted	Serviço #423 deletado	1	{"serviceId":423}	2025-11-23 16:05:46.771374
420	129	422	\N	service_deleted	Serviço #422 deletado	1	{"serviceId":422}	2025-11-23 16:05:51.235955
421	138	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 16:06:20.398
422	138	429	\N	converted_to_service	Chamado convertido em serviço: Último testes de notificações 	1	\N	2025-11-23 16:06:30.276
423	138	429	1078	converted_to_financial	Serviço convertido para faturamento: Último testes de notificações 	1	\N	2025-11-23 16:06:50.389
424	138	429	\N	service_deleted	Serviço #429 deletado	1	{"serviceId":429}	2025-11-23 16:06:52.058974
425	138	429	1078	transaction_deleted	Transação #1078 deletada - R$ 500.00	1	{"transactionId":1078,"amount":"500.00"}	2025-11-23 16:08:54.249749
426	139	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 16:38:23.492
427	139	\N	\N	call_deleted	Chamado #139 deletado	1	{"callId":139}	2025-11-23 16:44:20.113475
428	140	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 16:44:36.269
429	140	\N	\N	call_deleted	Chamado #140 deletado	1	{"callId":140}	2025-11-23 16:44:53.590701
430	141	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 16:45:04.53
431	141	430	\N	converted_to_service	Chamado convertido em serviço: Kakajsjdj	1	\N	2025-11-23 16:45:55.71
432	141	430	\N	service_deleted	Serviço #430 deletado	1	{"serviceId":430}	2025-11-23 16:46:08.832077
433	142	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 16:58:23.487
434	142	\N	\N	call_deleted	Chamado #142 deletado	1	{"callId":142}	2025-11-23 16:58:39.7199
435	143	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 16:58:50.774
436	143	\N	\N	call_deleted	Chamado #143 deletado	1	{"callId":143}	2025-11-23 16:59:06.691488
437	144	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-23 17:38:42.555
438	144	431	\N	converted_to_service	Chamado convertido em serviço: Testes	1	\N	2025-11-23 17:39:28.382
439	144	432	\N	converted_to_service	Chamado convertido em serviço: Testes	1	\N	2025-11-23 17:39:30.037
440	144	431	\N	service_updated	Serviço #431 atualizado	1	{"serviceId":431}	2025-11-23 17:40:03.984491
441	144	431	\N	service_updated	Serviço #431 atualizado	1	{"serviceId":431}	2025-11-23 17:40:05.452648
442	144	432	\N	service_updated	Serviço #432 atualizado	1	{"serviceId":432}	2025-11-23 17:40:33.418982
443	144	432	1079	converted_to_financial	Serviço convertido para faturamento: Testes	1	\N	2025-11-23 17:42:49.935
444	144	432	\N	service_deleted	Serviço #432 deletado	1	{"serviceId":432}	2025-11-23 17:42:51.716667
445	144	431	\N	service_deleted	Serviço #431 deletado	1	{"serviceId":431}	2025-11-23 17:50:52.563275
446	144	432	1079	transaction_deleted	Transação #1079 deletada - R$ 150.00	1	{"transactionId":1079,"amount":"150.00"}	2025-11-23 17:51:03.424287
447	\N	433	\N	service_created	Serviço criado: CPU Dell 3010 8gb RAM SSD 128gb + HD 320gb	1	\N	2025-11-23 23:38:30.723
448	\N	\N	\N	client_created	Cliente Shirley Aquino - Abel criado	1	{"clientId":140,"clientName":"Shirley Aquino - Abel"}	2025-11-23 23:40:41.11172
449	145	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-23 23:40:53.725
450	\N	\N	\N	client_created	Cliente Alcimar Gurgel criado	1	{"clientId":141,"clientName":"Alcimar Gurgel"}	2025-11-24 00:06:16.331019
451	\N	434	\N	service_created	Serviço criado: Manutenção impressora Epson	5	\N	2025-11-21 03:00:00
452	\N	434	\N	service_updated	Serviço #434 atualizado	1	{"serviceId":434}	2025-11-24 00:12:30.404291
453	146	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-24 00:16:52.156
454	295	308	\N	service_updated	Serviço #308 atualizado	1	{"serviceId":308}	2025-11-24 00:19:16.260613
455	146	\N	\N	call_deleted	Chamado #146 deletado	1	{"callId":146}	2025-11-24 00:22:12.018051
456	\N	433	\N	service_updated	Serviço #433 atualizado	1	{"serviceId":433}	2025-11-24 00:23:08.465469
457	\N	433	\N	service_updated	Serviço #433 atualizado	1	{"serviceId":433}	2025-11-24 00:23:09.853796
458	346	358	\N	service_updated	Serviço #358 atualizado	1	{"serviceId":358}	2025-11-24 00:24:30.203791
459	346	358	1080	converted_to_financial	Serviço convertido para faturamento: Verificar barulho máquina Alcimar. 	5	\N	2025-11-24 00:24:43.096
460	346	358	\N	service_deleted	Serviço #358 deletado	5	{"serviceId":358}	2025-11-24 00:24:45.069677
461	\N	435	\N	service_created	Serviço criado: Verificar barulho máquina Alcimar.	5	\N	2025-11-24 00:30:49.092
527	156	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-24 13:56:08.833364
462	346	358	1080	transaction_deleted	Transação #1080 deletada - R$ 355.00	1	{"transactionId":1080,"amount":"355.00"}	2025-11-24 00:30:52.203997
463	147	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-24 01:21:15.768
464	147	\N	\N	call_deleted	Chamado #147 deletado	1	{"callId":147}	2025-11-24 01:21:25.910167
465	148	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-24 01:21:56.383
466	148	\N	\N	call_updated	Chamado #148 atualizado	1	{"callId":148}	2025-11-24 01:22:21.102481
467	148	\N	\N	call_updated	Chamado #148 atualizado	1	{"callId":148}	2025-11-24 01:38:20.130664
468	148	\N	\N	call_updated	Chamado #148 atualizado	1	{"callId":148}	2025-11-24 01:41:45.168416
469	\N	435	\N	service_updated	Serviço #435 atualizado	1	{"serviceId":435}	2025-11-24 01:42:14.673295
470	\N	435	\N	service_updated	Serviço #435 atualizado	1	{"serviceId":435}	2025-11-24 01:42:35.77191
471	148	436	\N	converted_to_service	Chamado convertido em serviço: Teste teste teste	1	\N	2025-11-24 01:43:00.758374
472	148	436	\N	service_updated	Serviço #436 atualizado	1	{"serviceId":436}	2025-11-24 01:43:26.563586
473	148	436	1081	converted_to_financial	Serviço convertido para faturamento: Teste teste teste	1	\N	2025-11-24 01:43:42.715953
474	148	436	\N	service_deleted	Serviço #436 deletado	1	{"serviceId":436}	2025-11-24 01:43:44.54267
475	148	436	1081	payment_received	Pagamento recebido: Teste teste teste	1	\N	2025-11-24 01:45:03.761504
476	148	436	1081	transaction_updated	Transação #1081 atualizada - Status: pago → pendente	1	{"transactionId":1081,"oldStatus":"pago","newStatus":"pendente"}	2025-11-24 01:45:18.179654
477	148	\N	1082	payment_received	Pagamento recebido: Parcela 1 - Teste teste teste	1	\N	2025-11-24 02:04:46.136425
478	\N	437	\N	service_created	Serviço criado: Teste teste teste	1	\N	2025-11-24 02:44:27.452351
479	148	436	1081	transaction_deleted	Transação #1081 deletada - R$ 50.00	1	{"transactionId":1081,"amount":"50.00"}	2025-11-24 02:44:29.439912
480	\N	437	\N	service_deleted	Serviço #437 deletado	1	{"serviceId":437}	2025-11-24 02:45:02.952256
481	149	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-24 10:38:38.790269
482	149	438	\N	converted_to_service	Chamado convertido em serviço: Teste	1	\N	2025-11-24 10:38:54.238223
483	149	438	\N	service_updated	Serviço #438 atualizado	1	{"serviceId":438}	2025-11-24 10:39:23.232082
484	149	438	1083	converted_to_financial	Serviço convertido para faturamento: Teste	1	\N	2025-11-24 10:39:44.718387
485	149	438	\N	service_deleted	Serviço #438 deletado	1	{"serviceId":438}	2025-11-24 10:39:46.444778
486	149	\N	1084	payment_received	Pagamento recebido: Parcela 1 - Teste	1	\N	2025-11-24 10:41:48.367666
487	149	438	1083	transaction_deleted	Transação #1083 deletada - R$ 1000.00	1	{"transactionId":1083,"amount":"1000.00"}	2025-11-24 10:42:13.834
488	\N	435	1086	converted_to_financial	Serviço convertido para faturamento: Verificar barulho máquina Alcimar.	5	\N	2025-11-24 10:51:29.079921
489	\N	435	\N	service_deleted	Serviço #435 deletado	5	{"serviceId":435}	2025-11-24 10:51:31.082075
490	150	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-24 10:54:40.1324
491	150	439	\N	converted_to_service	Chamado convertido em serviço: Testes	1	\N	2025-11-24 10:54:44.89478
492	150	439	\N	service_updated	Serviço #439 atualizado	1	{"serviceId":439}	2025-11-24 10:55:03.484249
493	150	439	1087	converted_to_financial	Serviço convertido para faturamento: Testes	1	\N	2025-11-24 10:55:15.767649
494	150	439	\N	service_deleted	Serviço #439 deletado	1	{"serviceId":439}	2025-11-24 10:55:17.501043
495	\N	440	\N	service_created	Serviço criado: Testes	1	\N	2025-11-24 11:03:49.854637
496	150	439	1087	transaction_deleted	Transação #1087 deletada - R$ 50.00	1	{"transactionId":1087,"amount":"50.00"}	2025-11-24 11:03:51.714649
497	\N	440	\N	service_updated	Serviço #440 atualizado	1	{"serviceId":440}	2025-11-24 11:04:18.622017
498	\N	\N	\N	client_created	Cliente San Saúde criado	1	{"clientId":142,"clientName":"San Saúde"}	2025-11-24 11:04:33.849053
499	\N	440	\N	service_updated	Serviço #440 atualizado	1	{"serviceId":440}	2025-11-24 11:04:45.175463
500	151	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-24 11:04:48.736926
501	\N	440	1088	converted_to_financial	Serviço convertido para faturamento: Testes	1	\N	2025-11-24 11:04:53.758355
502	\N	440	\N	service_deleted	Serviço #440 deletado	1	{"serviceId":440}	2025-11-24 11:04:55.506566
503	\N	440	1088	transaction_deleted	Transação #1088 deletada - R$ 250.00	1	{"transactionId":1088,"amount":"250.00"}	2025-11-24 11:22:56.035901
504	105	\N	\N	call_updated	Chamado #105 atualizado	5	{"callId":105}	2025-11-24 11:31:44.153141
505	\N	441	\N	service_created	Serviço criado: Tedtes	1	\N	2025-11-24 11:33:23.422348
506	152	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-24 11:33:55.470755
507	152	442	\N	converted_to_service	Chamado convertido em serviço: Tsydjfkfkfkfkfkf	1	\N	2025-11-24 11:34:01.43497
508	152	442	\N	service_updated	Serviço #442 atualizado	1	{"serviceId":442}	2025-11-24 11:34:37.31034
509	152	442	1089	converted_to_financial	Serviço convertido para faturamento: Tsydjfkfkfkfkfkf	1	\N	2025-11-24 11:34:46.681068
510	152	442	\N	service_deleted	Serviço #442 deletado	1	{"serviceId":442}	2025-11-24 11:34:48.460567
511	\N	443	\N	service_created	Serviço criado: Tested	1	\N	2025-11-24 11:39:31.396765
512	\N	443	\N	service_updated	Serviço #443 atualizado	1	{"serviceId":443}	2025-11-24 11:39:47.447274
513	\N	443	\N	service_updated	Serviço #443 atualizado	1	{"serviceId":443}	2025-11-24 11:48:44.03432
514	\N	443	1090	converted_to_financial	Serviço convertido para faturamento: Tested	1	\N	2025-11-24 11:49:01.044453
515	\N	443	\N	service_deleted	Serviço #443 deletado	1	{"serviceId":443}	2025-11-24 11:49:02.822358
516	\N	443	1090	transaction_deleted	Transação #1090 deletada - R$ 350.00	1	{"transactionId":1090,"amount":"350.00"}	2025-11-24 11:49:24.514938
517	152	442	1089	transaction_deleted	Transação #1089 deletada - R$ 210.00	1	{"transactionId":1089,"amount":"210.00"}	2025-11-24 11:49:42.040265
518	\N	402	1091	converted_to_financial	Serviço convertido para faturamento: Manutenção na cabeça de impressão	1	\N	2025-11-24 12:10:54.4511
519	\N	402	\N	service_deleted	Serviço #402 deletado	1	{"serviceId":402}	2025-11-24 12:10:56.592418
520	153	\N	\N	call_created	Chamado criado: 	5	\N	2025-11-24 12:11:53.267475
521	\N	433	\N	service_updated	Serviço #433 atualizado	1	{"serviceId":433}	2025-11-24 12:11:59.163914
522	100	400	\N	service_updated	Serviço #400 atualizado	1	{"serviceId":400}	2025-11-24 13:00:57.70386
523	100	400	\N	service_updated	Serviço #400 atualizado	1	{"serviceId":400}	2025-11-24 13:02:17.805386
524	154	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-24 13:03:24.425506
525	155	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-24 13:06:59.081294
526	\N	\N	\N	client_created	Cliente Botoclinic Mossoró criado	5	{"clientId":143,"clientName":"Botoclinic Mossoró"}	2025-11-24 13:55:27.072954
528	153	\N	\N	call_updated	Chamado #153 atualizado	5	{"callId":153}	2025-11-24 13:57:28.170114
529	157	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-24 14:23:57.692328
530	157	444	\N	converted_to_service	Chamado convertido em serviço: teadsadsadsadsadsadsa	1	\N	2025-11-24 14:24:03.226178
531	157	444	\N	service_deleted	Serviço #444 deletado	1	{"serviceId":444}	2025-11-24 14:24:38.579127
532	\N	406	\N	service_deleted	Serviço #406 deletado	5	{"serviceId":406}	2025-11-24 16:40:03.620755
533	\N	434	1092	converted_to_financial	Serviço convertido para faturamento: Manutenção impressora Epson	5	\N	2025-11-24 16:40:27.541342
534	\N	434	\N	service_deleted	Serviço #434 deletado	5	{"serviceId":434}	2025-11-24 16:40:29.474154
535	341	345	516	payment_received	Pagamento recebido: Serviço de Manutenção impressora Epson L3250 - Consultório Dr. Dirceu. Limpeza interna, lubrificação, troca das almofadas do descarte e reset. Peça + Serviço.	1	\N	2025-11-24 16:45:47.499877
536	307	338	510	payment_received	Pagamento recebido: Visita técnica para analisar estabilizador. .	1	\N	2025-11-24 16:46:05.45509
537	115	\N	\N	call_deleted	Chamado #115 deletado	1	{"callId":115}	2025-11-24 16:47:31.039358
538	116	\N	\N	call_deleted	Chamado #116 deletado	1	{"callId":116}	2025-11-24 16:51:30.129532
539	108	445	\N	converted_to_service	Chamado convertido em serviço: Problema mouse para e upgrade de memória	5	\N	2025-11-24 16:51:48.320313
540	103	\N	\N	call_deleted	Chamado #103 deletado	1	{"callId":103}	2025-11-24 16:52:37.093329
541	\N	\N	\N	client_created	Cliente testes assistencia criado	1	{"clientId":144,"clientName":"testes assistencia"}	2025-11-24 19:08:36.645226
542	158	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-24 19:08:52.880934
543	158	446	\N	converted_to_service	Chamado convertido em serviço: testes	1	\N	2025-11-24 19:08:59.6742
544	158	446	\N	service_updated	Serviço #446 atualizado	1	{"serviceId":446}	2025-11-24 19:09:13.605873
545	158	446	1093	converted_to_financial	Serviço convertido para faturamento: testes	1	\N	2025-11-24 19:10:39.170768
546	158	446	\N	service_deleted	Serviço #446 deletado	1	{"serviceId":446}	2025-11-24 19:10:41.040041
547	\N	\N	\N	client_created	Cliente 1111 criado	1	{"clientId":145,"clientName":"1111"}	2025-11-24 19:25:02.856348
548	159	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-24 19:25:28.737418
549	159	447	\N	converted_to_service	Chamado convertido em serviço: testes	1	\N	2025-11-24 19:25:36.800973
550	159	447	\N	service_updated	Serviço #447 atualizado	1	{"serviceId":447}	2025-11-24 19:26:03.330559
551	159	447	1094	converted_to_financial	Serviço convertido para faturamento: testes	1	\N	2025-11-24 19:26:08.860364
552	159	447	\N	service_deleted	Serviço #447 deletado	1	{"serviceId":447}	2025-11-24 19:26:10.794264
553	\N	\N	\N	client_deleted	Cliente 1111 deletado	1	{"clientId":145,"clientName":"1111"}	2025-11-24 19:30:43.319824
554	\N	\N	\N	client_created	Cliente 111111 criado	1	{"clientId":146,"clientName":"111111"}	2025-11-24 19:31:09.168183
555	160	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-24 19:31:22.14325
556	160	448	\N	converted_to_service	Chamado convertido em serviço: sadsaddadaasdasdsa	1	\N	2025-11-24 19:31:26.908918
557	160	448	\N	service_updated	Serviço #448 atualizado	1	{"serviceId":448}	2025-11-24 19:31:47.402306
558	158	446	1093	transaction_deleted	Transação #1093 deletada - R$ 200.00	1	{"transactionId":1093,"amount":"200.00"}	2025-11-24 19:42:06.12773
559	159	447	1094	transaction_deleted	Transação #1094 deletada - R$ 300.00	1	{"transactionId":1094,"amount":"300.00"}	2025-11-24 19:42:17.14327
560	154	449	\N	converted_to_service	Chamado convertido em serviço: Visita técnica para fazer instalação de roteador principal e ajustes na rede, garantindo que todos os computadores da clínica tenham internet e acesso ao sistema Doctors	1	\N	2025-11-24 20:16:23.271893
561	154	450	\N	converted_to_service	Chamado convertido em serviço: Visita técnica para fazer instalação de roteador principal e ajustes na rede, garantindo que todos os computadores da clínica tenham internet e acesso ao sistema Doctors	1	\N	2025-11-24 20:16:24.949882
562	154	449	\N	service_updated	Serviço #449 atualizado	1	{"serviceId":449}	2025-11-24 20:17:13.288401
563	154	450	\N	service_deleted	Serviço #450 deletado	1	{"serviceId":450}	2025-11-24 20:17:49.356757
564	154	449	1095	converted_to_financial	Serviço convertido para faturamento: Visita técnica para fazer instalação de roteador principal e ajustes na rede, garantindo que todos os computadores da clínica tenham internet e acesso ao sistema Doctors	1	\N	2025-11-24 20:18:05.110549
565	154	449	\N	service_deleted	Serviço #449 deletado	1	{"serviceId":449}	2025-11-24 20:18:06.909209
566	\N	403	1096	converted_to_financial	Serviço convertido para faturamento: Reparo no no-break do alarme e internet	1	\N	2025-11-24 20:19:38.770689
567	\N	403	\N	service_deleted	Serviço #403 deletado	1	{"serviceId":403}	2025-11-24 20:19:40.609616
568	\N	433	1097	converted_to_financial	Serviço convertido para faturamento: CPU Dell 3010 8gb RAM SSD 128gb + HD 320gb	1	\N	2025-11-24 20:20:15.255101
569	\N	433	\N	service_deleted	Serviço #433 deletado	1	{"serviceId":433}	2025-11-24 20:20:17.394244
570	261	300	1098	converted_to_financial	Serviço convertido para faturamento: CPU do carrinho com problemas e impressora do balcão apresentando atolamento de papel	1	\N	2025-11-24 20:21:17.311535
571	261	300	\N	service_deleted	Serviço #300 deletado	1	{"serviceId":300}	2025-11-24 20:21:19.232165
572	155	451	\N	converted_to_service	Chamado convertido em serviço: PC do caixa não liga	1	\N	2025-11-24 20:22:27.361993
573	105	452	\N	converted_to_service	Chamado convertido em serviço: Obra medical center. \nDesmontagem e passagem dos novos cabos para efetuar obra. Remontagem de equipamentos após obra. \n\nSó falta agora colocar as 4 câmeras pra funcionar. \n\nFoi usado 200 metros de cabo. 2 canaletas. \n4 câmeras recepção e faixada.	5	\N	2025-11-24 20:23:02.833089
574	105	452	\N	service_updated	Serviço #452 atualizado	1	{"serviceId":452}	2025-11-24 20:35:45.486162
575	105	452	\N	service_updated	Serviço #452 atualizado	1	{"serviceId":452}	2025-11-24 20:48:32.557156
576	105	452	\N	service_updated	Serviço #452 atualizado	1	{"serviceId":452}	2025-11-24 20:48:34.283021
577	161	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-24 23:04:31.809946
578	162	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-24 23:14:32.798375
579	163	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-24 23:18:04.185103
580	163	\N	\N	call_deleted	Chamado #163 deletado	1	{"callId":163}	2025-11-24 23:18:30.54464
581	164	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-24 23:19:20.044831
582	164	\N	\N	call_deleted	Chamado #164 deletado	1	{"callId":164}	2025-11-24 23:21:03.077855
583	162	\N	\N	call_deleted	Chamado #162 deletado	1	{"callId":162}	2025-11-24 23:21:08.778042
584	161	\N	\N	call_deleted	Chamado #161 deletado	1	{"callId":161}	2025-11-24 23:21:14.519234
585	165	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-24 23:22:24.591123
586	166	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-24 23:28:46.198943
587	167	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-24 23:33:55.61108
588	167	\N	\N	call_deleted	Chamado #167 deletado	9	{"callId":167}	2025-11-24 23:34:10.552835
589	166	\N	\N	call_deleted	Chamado #166 deletado	9	{"callId":166}	2025-11-24 23:34:30.947535
590	165	\N	\N	call_deleted	Chamado #165 deletado	9	{"callId":165}	2025-11-24 23:34:40.857622
591	160	448	\N	service_deleted	Serviço #448 deletado	9	{"serviceId":448}	2025-11-24 23:35:41.152661
592	168	\N	\N	call_created	Chamado criado: 	10	\N	2025-11-24 23:37:35.44472
593	168	\N	\N	call_deleted	Chamado #168 deletado	10	{"callId":168}	2025-11-24 23:37:46.453857
594	169	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-24 23:40:13.866551
595	169	453	\N	converted_to_service	Chamado convertido em serviço: sadsdasdasda	1	\N	2025-11-24 23:40:48.852958
596	\N	\N	1099	converted_to_financial	Serviço convertido para faturamento: testesssss	1	\N	2025-11-24 23:55:30.84891
597	\N	\N	1099	transaction_deleted	Transação #1099 deletada - R$ 500.00	1	{"transactionId":1099,"amount":"500.00"}	2025-11-24 23:59:07.615118
598	\N	\N	1105	converted_to_financial	Serviço convertido para faturamento: testes	1	\N	2025-11-25 00:01:47.922223
599	\N	\N	1105	transaction_deleted	Transação #1105 deletada - R$ 500.00	1	{"transactionId":1105,"amount":"500.00"}	2025-11-25 00:05:31.021043
600	\N	\N	1112	converted_to_financial	Serviço convertido para faturamento: testes	1	\N	2025-11-25 00:06:25.199712
601	\N	\N	1112	transaction_deleted	Transação #1112 deletada - R$ 500.00	1	{"transactionId":1112,"amount":"500.00"}	2025-11-25 00:11:59.436167
602	\N	\N	1123	converted_to_financial	Serviço convertido para faturamento: testes	1	\N	2025-11-25 00:12:31.715056
603	\N	\N	1134	converted_to_financial	Serviço convertido para faturamento: testes	1	\N	2025-11-25 00:16:59.174255
604	\N	\N	1136	payment_received	Pagamento recebido: Parcela 2 - testes	1	\N	2025-11-25 00:17:39.804056
605	\N	\N	1134	transaction_deleted	Transação #1134 deletada - R$ 300.00	1	{"transactionId":1134,"amount":"300.00"}	2025-11-25 00:17:58.768127
606	\N	\N	1123	transaction_deleted	Transação #1123 deletada - R$ 500.00	1	{"transactionId":1123,"amount":"500.00"}	2025-11-25 00:18:09.96995
607	169	453	\N	service_deleted	Serviço #453 deletado	1	{"serviceId":453}	2025-11-25 00:38:57.670073
608	170	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-25 00:40:10.08903
609	170	454	\N	converted_to_service	Chamado convertido em serviço: tesadadasdas	1	\N	2025-11-25 00:41:07.124057
610	170	454	\N	service_updated	Serviço #454 atualizado	1	{"serviceId":454}	2025-11-25 00:42:20.686039
611	153	\N	\N	call_updated	Chamado #153 atualizado	5	{"callId":153}	2025-11-25 01:13:01.672393
612	151	\N	\N	call_updated	Chamado #151 atualizado	5	{"callId":151}	2025-11-25 01:13:18.006465
613	111	\N	\N	call_updated	Chamado #111 atualizado	1	{"callId":111}	2025-11-25 01:13:30.523946
614	171	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-25 01:28:38.997019
615	\N	\N	\N	client_deleted	Cliente 111111 deletado	1	{"clientId":146,"clientName":"111111"}	2025-11-25 02:44:37.025232
616	\N	\N	\N	client_created	Cliente 11111111 criado	1	{"clientId":147,"clientName":"11111111"}	2025-11-25 02:46:33.229147
617	101	\N	\N	call_deleted	Chamado #101 deletado	9	{"callId":101}	2025-11-25 02:47:34.576876
618	172	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-25 02:53:01.635961
619	172	\N	\N	call_deleted	Chamado #172 deletado	9	{"callId":172}	2025-11-25 02:53:21.718484
620	173	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-25 02:53:59.367951
621	173	\N	\N	call_deleted	Chamado #173 deletado	1	{"callId":173}	2025-11-25 02:54:13.36799
622	109	455	\N	converted_to_service	Chamado convertido em serviço: Pc depósito reiniciando sozinho	9	\N	2025-11-25 02:54:43.573657
623	109	455	\N	service_updated	Serviço #455 atualizado	1	{"serviceId":455}	2025-11-25 02:56:26.328551
624	109	455	\N	service_updated	Serviço #455 atualizado	1	{"serviceId":455}	2025-11-25 02:56:28.067293
625	109	455	\N	service_updated	Serviço #455 atualizado	1	{"serviceId":455}	2025-11-25 02:56:28.561584
626	359	357	1141	converted_to_financial	Serviço convertido para faturamento: Notebook para fazer manutenção.	5	\N	2025-11-25 03:00:08.823681
627	359	357	\N	service_deleted	Serviço #357 deletado	9	{"serviceId":357}	2025-11-25 03:00:10.633806
628	359	357	1141	payment_received	Pagamento recebido: Notebook para fazer manutenção.	9	\N	2025-11-25 03:01:05.380741
629	\N	456	\N	service_created	Serviço criado: Desktop Dell Depósito Reiniciando.	9	\N	2025-11-25 03:08:23.601062
630	\N	456	\N	service_updated	Serviço #456 atualizado	1	{"serviceId":456}	2025-11-25 03:11:29.807663
631	\N	456	1142	converted_to_financial	Serviço convertido para faturamento: Desktop Dell Depósito Reiniciando.	9	\N	2025-11-25 03:11:56.733068
632	\N	456	\N	service_deleted	Serviço #456 deletado	9	{"serviceId":456}	2025-11-25 03:11:58.414938
633	153	457	\N	converted_to_service	Chamado convertido em serviço: Verificar máquina de Wigno depósito	9	\N	2025-11-25 03:14:00.579377
634	170	454	\N	service_deleted	Serviço #454 deletado	1	{"serviceId":454}	2025-11-25 03:14:31.642355
635	153	457	\N	service_updated	Serviço #457 atualizado	1	{"serviceId":457}	2025-11-25 03:17:51.916404
636	153	457	1143	converted_to_financial	Serviço convertido para faturamento: Verificar máquina de Wigno depósito	9	\N	2025-11-25 03:18:14.762494
637	153	457	\N	service_deleted	Serviço #457 deletado	9	{"serviceId":457}	2025-11-25 03:18:16.486502
638	174	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-25 03:20:58.157301
639	\N	\N	\N	client_created	Cliente Policlínica criado	9	{"clientId":148,"clientName":"Policlínica"}	2025-11-25 03:20:59.48145
640	175	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-25 03:21:21.956443
641	151	\N	\N	call_deleted	Chamado #151 deletado	9	{"callId":151}	2025-11-25 03:21:55.565037
642	102	458	\N	converted_to_service	Chamado convertido em serviço: Revisão no sistema de câmeras e ajustes no sistema de som	1	\N	2025-11-25 03:22:02.753603
643	171	\N	\N	call_deleted	Chamado #171 deletado	9	{"callId":171}	2025-11-25 03:22:07.559857
644	145	459	\N	converted_to_service	Chamado convertido em serviço: Pegar impressora Epson para fazer manutenção.	9	\N	2025-11-25 03:22:18.805127
645	113	\N	\N	call_deleted	Chamado #113 deletado	9	{"callId":113}	2025-11-25 03:22:58.761181
646	107	460	\N	converted_to_service	Chamado convertido em serviço: Internet portão de eventos	9	\N	2025-11-25 03:23:08.183845
647	107	460	\N	service_updated	Serviço #460 atualizado	9	{"serviceId":460}	2025-11-25 03:25:00.607347
648	107	460	\N	service_updated	Serviço #460 atualizado	1	{"serviceId":460}	2025-11-25 03:26:16.119182
649	107	460	\N	service_updated	Serviço #460 atualizado	1	{"serviceId":460}	2025-11-25 03:26:17.8994
650	107	460	1144	converted_to_financial	Serviço convertido para faturamento: Internet portão de eventos	9	\N	2025-11-25 03:26:22.212609
651	107	460	\N	service_deleted	Serviço #460 deletado	9	{"serviceId":460}	2025-11-25 03:26:23.706386
652	176	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-25 12:55:36.011627
653	177	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-25 12:57:04.258255
654	178	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-25 13:05:18.646675
655	155	451	\N	service_updated	Serviço #451 atualizado	9	{"serviceId":451}	2025-11-25 13:07:16.612736
656	179	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-25 13:09:04.130126
657	180	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-25 13:09:45.495367
658	181	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-25 13:10:33.874155
659	182	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-25 13:20:58.16349
660	182	\N	\N	call_deleted	Chamado #182 deletado	1	{"callId":182}	2025-11-25 13:26:32.19222
661	181	\N	\N	call_deleted	Chamado #181 deletado	1	{"callId":181}	2025-11-25 13:26:37.151684
662	180	\N	\N	call_deleted	Chamado #180 deletado	1	{"callId":180}	2025-11-25 13:26:44.177995
663	179	\N	\N	call_deleted	Chamado #179 deletado	1	{"callId":179}	2025-11-25 13:26:52.161583
664	178	\N	\N	call_deleted	Chamado #178 deletado	1	{"callId":178}	2025-11-25 13:26:58.386545
665	\N	\N	\N	client_created	Cliente Depósito São Lourenço  criado	1	{"clientId":149,"clientName":"Depósito São Lourenço "}	2025-11-25 13:59:08.534925
666	183	\N	\N	call_created	Chamado criado: 	7	\N	2025-11-25 14:00:06.195755
667	184	\N	\N	call_created	Chamado criado: 	7	\N	2025-11-25 14:11:54.261178
668	184	461	\N	converted_to_service	Chamado convertido em serviço: Computador parou de ligar	7	\N	2025-11-25 14:12:15.881085
669	184	461	\N	service_updated	Serviço #461 atualizado	1	{"serviceId":461}	2025-11-25 14:13:27.311796
670	184	461	1145	converted_to_financial	Serviço convertido para faturamento: Computador parou de ligar	7	\N	2025-11-25 14:13:44.986928
671	184	461	\N	service_deleted	Serviço #461 deletado	7	{"serviceId":461}	2025-11-25 14:13:46.210068
672	185	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-25 16:12:00.172175
673	114	\N	\N	call_updated	Chamado #114 atualizado	9	{"callId":114}	2025-11-25 16:26:11.439461
674	114	\N	\N	call_updated	Chamado #114 atualizado	9	{"callId":114}	2025-11-25 16:26:12.860496
675	114	\N	\N	call_updated	Chamado #114 atualizado	9	{"callId":114}	2025-11-25 16:26:13.337483
676	156	\N	\N	call_updated	Chamado #156 atualizado	9	{"callId":156}	2025-11-25 16:26:35.095691
677	156	\N	\N	call_updated	Chamado #156 atualizado	9	{"callId":156}	2025-11-25 16:26:35.895168
678	156	\N	\N	call_updated	Chamado #156 atualizado	9	{"callId":156}	2025-11-25 16:26:37.319752
679	186	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-25 16:34:59.004913
680	187	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-25 16:36:02.771699
681	188	\N	\N	call_created	Chamado criado: 	10	\N	2025-11-25 17:01:58.371991
682	188	\N	\N	call_updated	Chamado #188 atualizado	10	{"callId":188}	2025-11-25 17:02:14.70828
683	188	462	\N	converted_to_service	Chamado convertido em serviço: Kfjshhsjdj	10	\N	2025-11-25 17:02:20.946151
684	188	462	\N	service_updated	Serviço #462 atualizado	10	{"serviceId":462}	2025-11-25 17:02:33.447367
685	188	462	\N	service_updated	Serviço #462 atualizado	1	{"serviceId":462}	2025-11-25 17:04:02.455761
686	186	\N	\N	call_deleted	Chamado #186 deletado	1	{"callId":186}	2025-11-25 18:24:48.73688
687	185	\N	\N	call_updated	Chamado #185 atualizado	1	{"callId":185}	2025-11-25 18:25:15.357371
688	155	451	\N	service_updated	Serviço #451 atualizado	1	{"serviceId":451}	2025-11-25 18:27:16.225277
689	155	451	1146	converted_to_financial	Serviço convertido para faturamento: PC do caixa não liga.	1	\N	2025-11-25 18:27:39.703983
690	155	451	\N	service_deleted	Serviço #451 deletado	1	{"serviceId":451}	2025-11-25 18:27:41.715137
691	188	462	\N	service_deleted	Serviço #462 deletado	1	{"serviceId":462}	2025-11-25 18:27:55.244173
692	189	\N	\N	call_created	Chamado criado: 	10	\N	2025-11-26 00:08:45.234999
693	189	\N	\N	call_updated	Chamado #189 atualizado	10	{"callId":189}	2025-11-26 00:09:01.863165
694	189	463	\N	converted_to_service	Chamado convertido em serviço: sadasdassd	10	\N	2025-11-26 00:09:13.967987
695	189	463	\N	service_updated	Serviço #463 atualizado	10	{"serviceId":463}	2025-11-26 00:09:23.085511
696	189	463	\N	service_updated	Serviço #463 atualizado	1	{"serviceId":463}	2025-11-26 00:09:36.163794
697	189	463	\N	service_updated	Serviço #463 atualizado	10	{"serviceId":463}	2025-11-26 00:16:21.435186
698	190	\N	\N	call_created	Chamado criado: 	10	\N	2025-11-26 00:31:36.765265
699	190	\N	\N	call_updated	Chamado #190 atualizado	10	{"callId":190}	2025-11-26 00:31:56.317966
700	190	464	\N	converted_to_service	Chamado convertido em serviço: sdadsaadsdasasdsdasda	10	\N	2025-11-26 00:32:14.719601
701	190	464	\N	service_updated	Serviço #464 atualizado	10	{"serviceId":464}	2025-11-26 00:32:46.002906
702	190	464	\N	service_updated	Serviço #464 atualizado	1	{"serviceId":464}	2025-11-26 00:33:26.542796
703	190	464	\N	service_updated	Serviço #464 atualizado	1	{"serviceId":464}	2025-11-26 00:39:38.373195
704	190	464	\N	service_updated	Serviço #464 atualizado	1	{"serviceId":464}	2025-11-26 00:43:36.592818
705	190	464	\N	service_updated	Serviço #464 atualizado	1	{"serviceId":464}	2025-11-26 00:45:32.545546
706	190	464	\N	service_updated	Serviço #464 atualizado	1	{"serviceId":464}	2025-11-26 00:47:21.262378
707	190	464	\N	service_updated	Serviço #464 atualizado	1	{"serviceId":464}	2025-11-26 00:49:41.319326
708	190	464	\N	service_updated	Serviço #464 atualizado	1	{"serviceId":464}	2025-11-26 00:51:20.046171
709	190	464	\N	service_updated	Serviço #464 atualizado	10	{"serviceId":464}	2025-11-26 00:55:56.020336
710	190	464	\N	service_updated	Serviço #464 atualizado	1	{"serviceId":464}	2025-11-26 00:56:13.410028
711	190	464	\N	service_updated	Serviço #464 atualizado	1	{"serviceId":464}	2025-11-26 00:58:18.067608
712	190	464	\N	service_updated	Serviço #464 atualizado	10	{"serviceId":464}	2025-11-26 01:02:47.267121
713	190	464	\N	service_deleted	Serviço #464 deletado	10	{"serviceId":464}	2025-11-26 01:03:13.189073
714	189	463	1147	converted_to_financial	Serviço convertido para faturamento: sadasdassd	10	\N	2025-11-26 01:03:34.316562
715	189	463	\N	service_deleted	Serviço #463 deletado	10	{"serviceId":463}	2025-11-26 01:03:36.224736
716	189	\N	1152	payment_received	Pagamento recebido: Parcela 2 - sadasdassd	10	\N	2025-11-26 01:06:43.16558
717	189	463	1147	transaction_deleted	Transação #1147 deletada - R$ 990.10	10	{"transactionId":1147,"amount":"990.10"}	2025-11-26 01:07:01.917435
718	\N	465	\N	service_created	Serviço criado: PC do caixa não liga.	10	\N	2025-11-26 01:07:46.31723
719	155	451	1146	transaction_deleted	Transação #1146 deletada - R$ 500.00	1	{"transactionId":1146,"amount":"500.00"}	2025-11-26 01:07:48.197108
720	191	\N	\N	call_created	Chamado criado: 	10	\N	2025-11-26 01:10:48.536824
721	191	\N	\N	call_updated	Chamado #191 atualizado	10	{"callId":191}	2025-11-26 01:10:56.851015
722	191	466	\N	converted_to_service	Chamado convertido em serviço: asddasddsasd	10	\N	2025-11-26 01:11:07.363383
723	191	466	\N	service_updated	Serviço #466 atualizado	10	{"serviceId":466}	2025-11-26 01:11:19.456104
724	191	466	\N	service_updated	Serviço #466 atualizado	10	{"serviceId":466}	2025-11-26 01:11:32.132732
725	191	466	1153	converted_to_financial	Serviço convertido para faturamento: asddasddsasd	10	\N	2025-11-26 01:11:40.49549
726	191	466	\N	service_deleted	Serviço #466 deletado	10	{"serviceId":466}	2025-11-26 01:11:42.382919
727	\N	467	\N	service_created	Serviço criado: asddasddsasd	10	\N	2025-11-26 01:12:17.877702
728	191	466	1153	transaction_deleted	Transação #1153 deletada - R$ 90.00	1	{"transactionId":1153,"amount":"90.00"}	2025-11-26 01:12:19.811866
729	\N	465	1154	converted_to_financial	Serviço convertido para faturamento: PC do caixa não liga.	10	\N	2025-11-26 01:17:10.307389
730	\N	465	\N	service_deleted	Serviço #465 deletado	10	{"serviceId":465}	2025-11-26 01:17:12.236315
731	\N	467	\N	service_updated	Serviço #467 atualizado	10	{"serviceId":467}	2025-11-26 01:17:26.567195
732	\N	467	1155	converted_to_financial	Serviço convertido para faturamento: asddasddsasd	10	\N	2025-11-26 01:17:38.546971
733	\N	467	\N	service_deleted	Serviço #467 deletado	10	{"serviceId":467}	2025-11-26 01:17:40.416599
734	\N	467	1155	discount_applied	Desconto de R$ 100,00 aplicado à transação #1155	10	{"transactionId":1155,"discount":100,"originalAmount":1100,"newAmount":1000}	2025-11-26 01:17:47.97335
735	\N	468	\N	service_created	Serviço criado: asddasddsasd	10	\N	2025-11-26 01:18:00.023017
736	\N	467	1155	transaction_deleted	Transação #1155 deletada - R$ 1000.00	1	{"transactionId":1155,"amount":"1000.00"}	2025-11-26 01:18:01.938945
737	\N	468	1156	converted_to_financial	Serviço convertido para faturamento: asddasddsasd	10	\N	2025-11-26 01:18:19.92264
738	\N	468	\N	service_deleted	Serviço #468 deletado	10	{"serviceId":468}	2025-11-26 01:18:21.804089
739	\N	468	1156	payment_received	Pagamento recebido: asddasddsasd	10	\N	2025-11-26 01:18:31.950299
740	\N	468	1156	transaction_updated	Transação #1156 atualizada - Status: pago → pendente	10	{"transactionId":1156,"oldStatus":"pago","newStatus":"pendente"}	2025-11-26 01:18:42.893885
741	187	\N	\N	call_updated	Chamado #187 atualizado	9	{"callId":187}	2025-11-26 01:19:18.162349
742	187	469	\N	converted_to_service	Chamado convertido em serviço: Teste	1	\N	2025-11-26 01:19:31.508748
743	187	469	\N	service_updated	Serviço #469 atualizado	1	{"serviceId":469}	2025-11-26 01:19:46.209223
744	187	469	1157	converted_to_financial	Serviço convertido para faturamento: Teste	1	\N	2025-11-26 01:19:53.061575
745	187	469	\N	service_deleted	Serviço #469 deletado	1	{"serviceId":469}	2025-11-26 01:19:54.913761
746	187	469	1157	discount_applied	Desconto de R$ 10,00 aplicado à transação #1157	1	{"transactionId":1157,"discount":10,"originalAmount":100,"newAmount":90}	2025-11-26 01:20:05.336188
747	\N	470	\N	service_created	Serviço criado: Teste	1	\N	2025-11-26 01:20:22.469129
748	187	469	1157	transaction_deleted	Transação #1157 deletada - R$ 90.00	1	{"transactionId":1157,"amount":"90.00"}	2025-11-26 01:20:24.380772
749	192	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-26 01:23:43.087758
750	192	\N	\N	call_updated	Chamado #192 atualizado	9	{"callId":192}	2025-11-26 01:23:54.609041
751	192	471	\N	converted_to_service	Chamado convertido em serviço: sdasdasdasdasdasdasdsdasda	9	\N	2025-11-26 01:24:00.977672
752	192	471	\N	service_updated	Serviço #471 atualizado	9	{"serviceId":471}	2025-11-26 01:24:14.478176
753	192	471	1158	converted_to_financial	Serviço convertido para faturamento: sdasdasdasdasdasdasdsdasda	9	\N	2025-11-26 01:24:37.106556
754	192	471	\N	service_deleted	Serviço #471 deletado	9	{"serviceId":471}	2025-11-26 01:24:38.965218
755	192	471	1158	discount_applied	Desconto de R$ 10,00 aplicado à transação #1158	9	{"transactionId":1158,"discount":10,"originalAmount":100,"newAmount":90}	2025-11-26 01:24:50.396461
756	\N	472	\N	service_created	Serviço criado: sdasdasdasdasdasdasdsdasda	9	\N	2025-11-26 01:24:55.460745
757	192	471	1158	transaction_deleted	Transação #1158 deletada - R$ 90.00	1	{"transactionId":1158,"amount":"90.00"}	2025-11-26 01:24:57.394349
758	193	\N	\N	call_created	Chamado criado: 	7	\N	2025-11-26 01:25:24.495255
759	193	\N	\N	call_updated	Chamado #193 atualizado	7	{"callId":193}	2025-11-26 01:25:32.448521
760	193	473	\N	converted_to_service	Chamado convertido em serviço: sadsdasdasdasdasda	7	\N	2025-11-26 01:25:39.303512
761	193	473	\N	service_updated	Serviço #473 atualizado	7	{"serviceId":473}	2025-11-26 01:25:49.575251
762	193	473	\N	service_updated	Serviço #473 atualizado	7	{"serviceId":473}	2025-11-26 01:25:55.288612
763	193	473	1159	converted_to_financial	Serviço convertido para faturamento: sadsdasdasdasdasda	7	\N	2025-11-26 01:26:08.044765
764	193	473	\N	service_deleted	Serviço #473 deletado	7	{"serviceId":473}	2025-11-26 01:26:09.968556
765	193	473	1159	discount_applied	Desconto de R$ 11,00 aplicado à transação #1159	7	{"transactionId":1159,"discount":11,"originalAmount":11111,"newAmount":11100}	2025-11-26 01:26:16.448456
766	193	473	1159	discount_applied	Desconto de R$ 1000,00 aplicado à transação #1159	7	{"transactionId":1159,"discount":1000,"originalAmount":11100,"newAmount":10100}	2025-11-26 01:26:40.922349
767	194	\N	\N	call_created	Chamado criado: 	11	\N	2025-11-26 01:30:02.309405
768	194	\N	\N	call_updated	Chamado #194 atualizado	11	{"callId":194}	2025-11-26 01:30:16.373917
769	194	474	\N	converted_to_service	Chamado convertido em serviço: ssdasdsdaasdsdadsasdadsa	11	\N	2025-11-26 01:30:20.664111
770	194	474	\N	service_updated	Serviço #474 atualizado	11	{"serviceId":474}	2025-11-26 01:30:33.835738
771	194	474	1160	converted_to_financial	Serviço convertido para faturamento: ssdasdsdaasdsdadsasdadsa	11	\N	2025-11-26 01:30:52.926937
772	194	474	\N	service_deleted	Serviço #474 deletado	11	{"serviceId":474}	2025-11-26 01:30:54.826224
773	194	474	1160	discount_applied	Desconto de R$ 10,00 aplicado à transação #1160	11	{"transactionId":1160,"discount":10,"originalAmount":100,"newAmount":90}	2025-11-26 01:31:17.770694
774	194	\N	1161	payment_received	Pagamento recebido: Parcela 1 - ssdasdsdaasdsdadsasdadsa	11	\N	2025-11-26 01:32:05.656988
775	193	473	1159	discount_applied	Desconto de R$ 100,00 aplicado à transação #1159	11	{"transactionId":1159,"discount":100,"originalAmount":10100,"newAmount":10000}	2025-11-26 01:36:02.439823
776	193	473	1159	transaction_deleted	Transação #1159 deletada - R$ 10000.00	11	{"transactionId":1159,"amount":"10000.00"}	2025-11-26 01:36:44.378599
777	195	\N	\N	call_created	Chamado criado: 	11	\N	2025-11-26 02:04:10.119568
778	195	\N	\N	call_deleted	Chamado #195 deletado	11	{"callId":195}	2025-11-26 02:09:05.61714
779	196	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-26 02:09:31.20445
780	196	\N	\N	call_deleted	Chamado #196 deletado	1	{"callId":196}	2025-11-26 02:09:43.841013
781	197	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-26 02:10:10.118802
782	197	475	\N	converted_to_service	Chamado convertido em serviço: dsasda	1	\N	2025-11-26 02:10:20.347942
783	197	475	\N	service_updated	Serviço #475 atualizado	1	{"serviceId":475}	2025-11-26 02:13:28.402053
784	\N	472	\N	service_updated	Serviço #472 atualizado	9	{"serviceId":472}	2025-11-26 02:15:38.677398
785	\N	476	\N	service_created	Serviço criado: testes	1	\N	2025-11-26 02:18:58.59561
786	156	\N	\N	call_updated	Chamado #156 atualizado	1	{"callId":156}	2025-11-26 02:22:36.553901
787	156	\N	\N	call_updated	Chamado #156 atualizado	1	{"callId":156}	2025-11-26 02:22:51.139164
788	156	\N	\N	call_updated	Chamado #156 atualizado	1	{"callId":156}	2025-11-26 02:23:12.919538
789	197	475	\N	service_updated	Serviço #475 atualizado	1	{"serviceId":475}	2025-11-26 02:23:27.472629
790	197	475	\N	service_updated	Serviço #475 atualizado	1	{"serviceId":475}	2025-11-26 02:23:49.253392
791	197	475	\N	service_updated	Serviço #475 atualizado	1	{"serviceId":475}	2025-11-26 02:25:37.574614
792	156	\N	\N	call_updated	Chamado #156 atualizado	1	{"callId":156}	2025-11-26 02:26:03.864354
793	197	475	\N	service_updated	Serviço #475 atualizado	1	{"serviceId":475}	2025-11-26 02:26:55.550156
794	197	475	\N	service_updated	Serviço #475 atualizado	1	{"serviceId":475}	2025-11-26 02:27:10.105225
795	156	\N	\N	call_updated	Chamado #156 atualizado	1	{"callId":156}	2025-11-26 02:27:20.194886
796	156	\N	\N	call_updated	Chamado #156 atualizado	1	{"callId":156}	2025-11-26 02:28:46.725991
797	156	\N	\N	call_updated	Chamado #156 atualizado	1	{"callId":156}	2025-11-26 02:29:31.846793
798	197	475	\N	service_updated	Serviço #475 atualizado	1	{"serviceId":475}	2025-11-26 02:29:52.745191
799	156	\N	\N	call_updated	Chamado #156 atualizado	1	{"callId":156}	2025-11-26 02:36:27.986295
800	198	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-26 02:45:01.839284
801	198	\N	\N	call_updated	Chamado #198 atualizado	1	{"callId":198}	2025-11-26 02:45:16.264573
802	198	477	\N	converted_to_service	Chamado convertido em serviço: sdadsasadsda	1	\N	2025-11-26 02:45:23.147519
803	198	477	\N	service_deleted	Serviço #477 deletado	1	{"serviceId":477}	2025-11-26 02:46:05.659972
804	197	475	\N	service_deleted	Serviço #475 deletado	1	{"serviceId":475}	2025-11-26 02:46:12.252557
805	\N	472	\N	service_deleted	Serviço #472 deletado	1	{"serviceId":472}	2025-11-26 02:46:18.072688
806	\N	470	\N	service_deleted	Serviço #470 deletado	1	{"serviceId":470}	2025-11-26 02:46:22.978722
807	108	445	\N	service_updated	Serviço #445 atualizado	5	{"serviceId":445}	2025-11-26 03:24:28.923643
808	108	445	\N	service_updated	Serviço #445 atualizado	5	{"serviceId":445}	2025-11-26 03:25:00.505371
809	114	\N	\N	call_updated	Chamado #114 atualizado	1	{"callId":114}	2025-11-26 03:25:34.071442
810	114	\N	\N	call_updated	Chamado #114 atualizado	1	{"callId":114}	2025-11-26 03:25:56.251393
811	176	\N	\N	call_updated	Chamado #176 atualizado	1	{"callId":176}	2025-11-26 03:26:47.057168
812	175	\N	\N	call_updated	Chamado #175 atualizado	1	{"callId":175}	2025-11-26 03:27:11.034442
813	112	\N	\N	call_updated	Chamado #112 atualizado	1	{"callId":112}	2025-11-26 03:27:26.533061
814	111	\N	\N	call_updated	Chamado #111 atualizado	1	{"callId":111}	2025-11-26 03:27:43.668522
815	106	\N	\N	call_updated	Chamado #106 atualizado	1	{"callId":106}	2025-11-26 03:27:59.229131
816	106	\N	\N	call_updated	Chamado #106 atualizado	1	{"callId":106}	2025-11-26 11:13:00.295737
817	185	\N	\N	call_updated	Chamado #185 atualizado	1	{"callId":185}	2025-11-26 11:31:05.639345
818	176	\N	\N	call_updated	Chamado #176 atualizado	1	{"callId":176}	2025-11-26 11:31:28.034203
819	177	\N	\N	call_updated	Chamado #177 atualizado	1	{"callId":177}	2025-11-26 11:31:52.300656
820	194	474	1160	transaction_deleted	Transação #1160 deletada - R$ 90.00	1	{"transactionId":1160,"amount":"90.00"}	2025-11-26 11:36:22.424699
821	\N	468	1156	transaction_deleted	Transação #1156 deletada - R$ 1100.00	1	{"transactionId":1156,"amount":"1100.00"}	2025-11-26 11:36:36.283428
822	\N	478	\N	service_created	Serviço criado: Computador parou de ligar	1	\N	2025-11-26 11:36:44.278602
823	184	461	1145	transaction_deleted	Transação #1145 deletada - R$ 200.00	1	{"transactionId":1145,"amount":"200.00"}	2025-11-26 11:36:46.392637
824	177	\N	\N	call_updated	Chamado #177 atualizado	1	{"callId":177}	2025-11-26 11:43:04.257438
825	177	\N	\N	call_updated	Chamado #177 atualizado	1	{"callId":177}	2025-11-26 11:43:23.722901
826	177	\N	\N	call_updated	Chamado #177 atualizado	1	{"callId":177}	2025-11-26 11:47:52.08316
827	177	\N	\N	call_updated	Chamado #177 atualizado	1	{"callId":177}	2025-11-26 12:53:52.170345
828	\N	\N	\N	client_created	Cliente Flademir Santana criado	9	{"clientId":150,"clientName":"Flademir Santana"}	2025-11-26 13:14:01.040569
829	199	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-26 13:14:01.471238
830	200	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-26 13:14:48.726542
831	156	479	\N	converted_to_service	Chamado convertido em serviço: Verificar impressora. Shopping Oitava Mall	9	\N	2025-11-26 13:16:48.622463
832	156	479	\N	service_updated	Serviço #479 atualizado	9	{"serviceId":479}	2025-11-26 13:19:49.883431
833	\N	480	\N	service_created	Serviço criado: Visita técnica Impressora	9	\N	2025-11-26 13:21:15.592328
834	\N	480	\N	service_updated	Serviço #480 atualizado	9	{"serviceId":480}	2025-11-26 13:21:38.818221
835	\N	480	1162	converted_to_financial	Serviço convertido para faturamento: Visita técnica Impressora	9	\N	2025-11-26 13:21:46.489597
836	\N	480	\N	service_deleted	Serviço #480 deletado	9	{"serviceId":480}	2025-11-26 13:21:48.447617
837	156	479	\N	service_updated	Serviço #479 atualizado	9	{"serviceId":479}	2025-11-26 13:28:57.828996
838	156	479	\N	service_updated	Serviço #479 atualizado	9	{"serviceId":479}	2025-11-26 13:28:59.136916
839	201	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-26 13:37:39.718657
840	156	479	1163	converted_to_financial	Serviço convertido para faturamento: Verificar impressora. Shopping Oitava Mall	9	\N	2025-11-26 13:52:44.301743
841	156	479	\N	service_deleted	Serviço #479 deletado	9	{"serviceId":479}	2025-11-26 13:52:46.602977
842	200	\N	\N	call_updated	Chamado #200 atualizado	1	{"callId":200}	2025-11-26 14:32:26.459668
843	201	\N	\N	call_updated	Chamado #201 atualizado	1	{"callId":201}	2025-11-26 14:32:49.224718
844	\N	478	\N	service_updated	Serviço #478 atualizado	1	{"serviceId":478}	2025-11-26 14:35:30.962749
845	\N	478	1164	converted_to_financial	Serviço convertido para faturamento: Computador parou de ligar	1	\N	2025-11-26 14:35:43.168197
846	\N	478	\N	service_deleted	Serviço #478 deletado	1	{"serviceId":478}	2025-11-26 14:35:45.149504
847	\N	478	1164	discount_applied	Desconto de R$ 20,00 aplicado à transação #1164	1	{"transactionId":1164,"discount":20,"originalAmount":420,"newAmount":400}	2025-11-26 14:35:53.086255
848	\N	133	1006	discount_applied	Desconto de R$ 100,00 aplicado à transação #1006	1	{"transactionId":1006,"discount":100,"originalAmount":180,"newAmount":80}	2025-11-26 15:47:25.723267
849	\N	133	1006	payment_received	Pagamento recebido: Impressora de fotos imprime até metade	1	\N	2025-11-26 15:47:33.531228
850	\N	133	1006	transaction_updated	Transação #1006 atualizada - Status: pago → pendente	1	{"transactionId":1006,"oldStatus":"pago","newStatus":"pendente"}	2025-11-26 15:47:46.993594
851	\N	133	1006	payment_received	Pagamento recebido: Impressora de fotos imprime até metade	1	\N	2025-11-26 15:47:56.807611
852	105	452	\N	service_updated	Serviço #452 atualizado	9	{"serviceId":452}	2025-11-26 16:03:42.191675
853	105	452	\N	service_updated	Serviço #452 atualizado	9	{"serviceId":452}	2025-11-26 16:04:00.650227
854	202	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-26 16:08:58.667288
855	203	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-26 16:09:35.330539
856	204	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-26 16:10:27.35029
857	205	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-26 16:22:43.755665
858	205	\N	\N	call_deleted	Chamado #205 deletado	1	{"callId":205}	2025-11-26 16:23:12.203964
859	145	459	\N	service_updated	Serviço #459 atualizado	9	{"serviceId":459}	2025-11-26 18:37:43.163086
860	145	459	\N	service_updated	Serviço #459 atualizado	9	{"serviceId":459}	2025-11-26 18:37:44.604881
861	145	459	1165	converted_to_financial	Serviço convertido para faturamento: Pegar impressora Epson para fazer manutenção.	9	\N	2025-11-26 18:37:52.575837
862	145	459	\N	service_deleted	Serviço #459 deletado	9	{"serviceId":459}	2025-11-26 18:37:54.791656
863	185	481	\N	converted_to_service	Chamado convertido em serviço: Monitor Dell 19" Jacinta	1	\N	2025-11-26 19:07:45.743148
864	185	481	\N	service_updated	Serviço #481 atualizado	1	{"serviceId":481}	2025-11-26 19:08:51.414346
865	185	481	1166	converted_to_financial	Serviço convertido para faturamento: Monitor Dell 19" Jacinta	1	\N	2025-11-26 19:09:53.350091
866	185	481	\N	service_deleted	Serviço #481 deletado	1	{"serviceId":481}	2025-11-26 19:09:55.619267
867	312	316	1167	converted_to_financial	Serviço convertido para faturamento: Manutenção Projetores Multimídia.	5	\N	2025-11-27 03:46:42.416417
868	312	316	\N	service_deleted	Serviço #316 deletado	9	{"serviceId":316}	2025-11-27 03:46:44.560128
869	\N	482	\N	service_created	Serviço criado: Visita técnica para fazer instalação de roteador principal e ajustes na rede, garantindo que todos os computadores da clínica tenham internet e acesso ao sistema Doctors	1	\N	2025-11-27 12:34:43.635532
870	154	449	1095	transaction_deleted	Transação #1095 deletada - R$ 100.00	1	{"transactionId":1095,"amount":"100.00"}	2025-11-27 12:34:45.677129
871	\N	482	\N	service_updated	Serviço #482 atualizado	1	{"serviceId":482}	2025-11-27 12:35:36.131053
872	\N	482	1168	converted_to_financial	Serviço convertido para faturamento: Visita técnica para fazer instalação de Switch e ajustes na rede, garantindo que todos os computadores da clínica tenham internet e acesso ao sistema Doctors	1	\N	2025-11-27 12:35:44.917841
873	\N	482	\N	service_deleted	Serviço #482 deletado	1	{"serviceId":482}	2025-11-27 12:35:46.771615
874	200	483	\N	converted_to_service	Chamado convertido em serviço: Instalação do sistema operacional máquina nova.	9	\N	2025-11-27 13:45:12.36643
875	176	484	\N	converted_to_service	Chamado convertido em serviço: Desktop Adryelle com barulho. Fazer limpeza. 	9	\N	2025-11-27 13:45:24.27039
876	206	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-27 15:28:33.699731
877	206	485	\N	converted_to_service	Chamado convertido em serviço: Ativação Windows 10	1	\N	2025-11-27 15:28:46.907122
878	206	485	\N	service_updated	Serviço #485 atualizado	1	{"serviceId":485}	2025-11-27 15:30:37.527464
879	206	485	1169	converted_to_financial	Serviço convertido para faturamento: Ativação Windows 10	1	\N	2025-11-27 15:30:47.810553
880	206	485	\N	service_deleted	Serviço #485 deletado	1	{"serviceId":485}	2025-11-27 15:30:49.865546
881	206	485	1169	payment_received	Pagamento recebido: Ativação Windows 10	1	\N	2025-11-27 15:31:01.833456
882	206	485	1169	transaction_updated	Transação #1169 atualizada - Status: pago → pendente	1	{"transactionId":1169,"oldStatus":"pago","newStatus":"pendente"}	2025-11-27 15:31:18.4246
883	206	485	1169	payment_received	Pagamento recebido: Ativação Windows 10	1	\N	2025-11-27 15:31:25.798158
884	\N	\N	1170	converted_to_financial	Serviço convertido para faturamento: 2x seriais windows 10 pro	1	\N	2025-11-27 15:37:38.706834
885	\N	\N	1170	payment_received	Pagamento recebido: 2x seriais windows 10 pro	1	\N	2025-11-27 15:37:51.497836
886	200	483	\N	service_updated	Serviço #483 atualizado	1	{"serviceId":483}	2025-11-27 21:08:44.057657
887	200	483	1171	converted_to_financial	Serviço convertido para faturamento: Instalação do sistema operacional máquina nova.	9	\N	2025-11-27 21:08:57.829516
888	200	483	\N	service_deleted	Serviço #483 deletado	1	{"serviceId":483}	2025-11-27 21:08:59.859696
889	203	486	\N	converted_to_service	Chamado convertido em serviço: Pegar note pra fazer upgrade	1	\N	2025-11-28 00:47:02.813474
890	175	\N	\N	call_deleted	Chamado #175 deletado	1	{"callId":175}	2025-11-28 00:49:08.718972
891	201	487	\N	converted_to_service	Chamado convertido em serviço: Impressora escritórios. Trocar cilindro. 	9	\N	2025-11-28 12:56:01.798365
892	200	483	1171	discount_applied	Desconto de R$ 5,00 aplicado à transação #1171	9	{"transactionId":1171,"discount":5,"originalAmount":195,"newAmount":190}	2025-11-28 12:56:42.173365
893	200	483	1171	payment_received	Pagamento recebido: Instalação do sistema operacional máquina nova.	9	\N	2025-11-28 12:56:50.213642
894	145	459	1165	payment_received	Pagamento recebido: Pegar impressora Epson para fazer manutenção.	9	\N	2025-11-28 12:57:08.440066
895	\N	435	1086	payment_received	Pagamento recebido: Verificar barulho máquina Alcimar.	9	\N	2025-11-28 12:58:07.385499
896	\N	488	\N	service_created	Serviço criado: Visita técnica Impressora	9	\N	2025-11-28 14:08:11.393578
897	\N	480	1162	transaction_deleted	Transação #1162 deletada - R$ 100.00	1	{"transactionId":1162,"amount":"100.00"}	2025-11-28 14:08:13.578026
898	\N	489	\N	service_created	Serviço criado: Verificar impressora. Shopping Oitava Mall	9	\N	2025-11-28 14:08:17.132032
899	156	479	1163	transaction_deleted	Transação #1163 deletada - R$ 350.00	1	{"transactionId":1163,"amount":"350.00"}	2025-11-28 14:08:19.123791
900	\N	488	1172	converted_to_financial	Serviço convertido para faturamento: Visita técnica Impressora	9	\N	2025-11-28 14:08:29.26239
901	\N	488	\N	service_deleted	Serviço #488 deletado	9	{"serviceId":488}	2025-11-28 14:08:31.285171
902	\N	489	\N	service_updated	Serviço #489 atualizado	9	{"serviceId":489}	2025-11-28 14:09:20.01226
903	\N	489	1173	converted_to_financial	Serviço convertido para faturamento: Verificar impressora. Shopping Oitava Mall	9	\N	2025-11-28 14:09:37.880968
904	\N	489	\N	service_deleted	Serviço #489 deletado	9	{"serviceId":489}	2025-11-28 14:09:39.755628
905	102	458	\N	service_updated	Serviço #458 atualizado	1	{"serviceId":458}	2025-11-28 16:09:31.781735
906	102	458	1174	converted_to_financial	Serviço convertido para faturamento: Revisão no sistema de câmeras e ajustes no sistema de som	1	\N	2025-11-28 16:10:28.827544
907	102	458	\N	service_deleted	Serviço #458 deletado	1	{"serviceId":458}	2025-11-28 16:10:30.834328
908	\N	433	1097	discount_applied	Desconto de R$ 100,00 aplicado à transação #1097	1	{"transactionId":1097,"discount":100,"originalAmount":1000,"newAmount":900}	2025-11-28 18:07:11.407625
909	\N	482	1168	discount_applied	Desconto de R$ 10,00 aplicado à transação #1168	1	{"transactionId":1168,"discount":10,"originalAmount":100,"newAmount":90}	2025-11-28 18:07:29.112959
910	\N	403	1096	discount_applied	Desconto de R$ 38,00 aplicado à transação #1096	1	{"transactionId":1096,"discount":38,"originalAmount":380,"newAmount":342}	2025-11-28 18:07:45.799855
911	\N	490	\N	service_created	Serviço criado: Verificar impressora. Shopping Oitava Mall	9	\N	2025-11-28 20:20:04.111122
912	\N	489	1173	transaction_deleted	Transação #1173 deletada - R$ 700.00	1	{"transactionId":1173,"amount":"700.00"}	2025-11-28 20:20:06.252195
913	\N	490	\N	service_updated	Serviço #490 atualizado	9	{"serviceId":490}	2025-11-28 20:22:10.911115
914	\N	490	1175	converted_to_financial	Serviço convertido para faturamento: Verificar impressora. Shopping Oitava Mall	9	\N	2025-11-28 20:22:21.974219
915	\N	490	\N	service_deleted	Serviço #490 deletado	9	{"serviceId":490}	2025-11-28 20:22:24.196538
916	\N	491	\N	service_created	Serviço criado: Verificar impressora. Shopping Oitava Mall	1	\N	2025-11-28 20:26:20.278934
917	\N	490	1175	transaction_deleted	Transação #1175 deletada - R$ 900.00	1	{"transactionId":1175,"amount":"900.00"}	2025-11-28 20:26:22.262412
918	\N	491	1176	converted_to_financial	Serviço convertido para faturamento: Verificar impressora. Shopping Oitava Mall	1	\N	2025-11-28 20:26:49.756429
919	\N	491	\N	service_deleted	Serviço #491 deletado	1	{"serviceId":491}	2025-11-28 20:26:51.709677
920	\N	492	\N	service_created	Serviço criado: Verificar impressora. Shopping Oitava Mall	9	\N	2025-11-28 20:27:05.60197
921	\N	493	\N	service_created	Serviço criado: Verificar impressora. Shopping Oitava Mall	9	\N	2025-11-28 20:27:13.633546
922	203	486	\N	service_deleted	Serviço #486 deletado	1	{"serviceId":486}	2025-11-28 20:28:27.691657
923	\N	492	\N	service_deleted	Serviço #492 deletado	1	{"serviceId":492}	2025-11-28 20:29:19.203966
924	\N	493	\N	service_updated	Serviço #493 atualizado	9	{"serviceId":493}	2025-11-28 20:30:19.131883
925	\N	493	1177	converted_to_financial	Serviço convertido para faturamento: Upgrade notebooks	9	\N	2025-11-28 20:30:26.265896
926	\N	493	\N	service_deleted	Serviço #493 deletado	9	{"serviceId":493}	2025-11-28 20:30:28.247986
927	\N	491	1176	transaction_deleted	Transação #1176 deletada - R$ 900.00	1	{"transactionId":1176,"amount":"900.00"}	2025-11-28 20:32:15.596631
928	207	\N	\N	call_created	Chamado criado: 	9	\N	2025-11-28 20:33:47.088562
929	207	494	\N	converted_to_service	Chamado convertido em serviço: Teste	9	\N	2025-11-28 20:33:55.036477
930	207	494	\N	service_deleted	Serviço #494 deletado	9	{"serviceId":494}	2025-11-28 20:34:37.890731
931	208	\N	\N	call_created	Chamado criado: 	7	\N	2025-11-28 20:34:48.839115
932	208	495	\N	converted_to_service	Chamado convertido em serviço: Tetstets	1	\N	2025-11-28 20:35:04.000545
933	208	495	1178	converted_to_financial	Serviço convertido para faturamento: Tetstets	1	\N	2025-11-28 20:43:39.725025
934	208	495	\N	service_deleted	Serviço #495 deletado	1	{"serviceId":495}	2025-11-28 20:43:41.726286
935	209	\N	\N	call_created	Chamado criado: 	7	\N	2025-11-28 20:45:16.171975
936	209	496	\N	converted_to_service	Chamado convertido em serviço: testesfsadsadsadsada	1	\N	2025-11-28 20:45:29.960063
937	210	\N	\N	call_created	Chamado criado: 	7	\N	2025-11-28 20:51:07.629227
938	210	497	\N	converted_to_service	Chamado convertido em serviço: sdadsaassdasdasasdasda	1	\N	2025-11-28 20:51:15.231261
939	210	497	\N	service_deleted	Serviço #497 deletado	7	{"serviceId":497}	2025-11-28 20:53:18.490491
940	209	496	\N	service_deleted	Serviço #496 deletado	7	{"serviceId":496}	2025-11-28 20:53:23.559783
941	211	\N	\N	call_created	Chamado criado: 	7	\N	2025-11-28 20:53:39.222843
942	211	498	\N	converted_to_service	Chamado convertido em serviço: sadsadsadsadsadsada	1	\N	2025-11-28 20:53:48.005195
943	211	498	\N	service_deleted	Serviço #498 deletado	7	{"serviceId":498}	2025-11-28 20:55:36.750638
944	105	452	\N	service_updated	Serviço #452 atualizado	7	{"serviceId":452}	2025-11-28 20:55:51.257825
945	212	\N	\N	call_created	Chamado criado: 	7	\N	2025-11-28 20:56:10.096823
946	212	499	\N	converted_to_service	Chamado convertido em serviço: sadsaddsdaasdsadsadsadsadsadsadsadsadsad	7	\N	2025-11-28 20:56:39.250149
947	212	499	\N	service_updated	Serviço #499 atualizado	7	{"serviceId":499}	2025-11-28 20:56:57.208143
948	212	499	1179	converted_to_financial	Serviço convertido para faturamento: sadsaddsdaasdsadsadsadsadsadsadsadsadsad	7	\N	2025-11-28 20:57:14.481702
949	212	499	\N	service_deleted	Serviço #499 deletado	7	{"serviceId":499}	2025-11-28 20:57:16.42639
950	\N	500	\N	service_created	Serviço criado: sadsaddsdaasdsadsadsadsadsadsadsadsadsad	7	\N	2025-11-28 20:57:27.468389
951	212	499	1179	transaction_deleted	Transação #1179 deletada - R$ 1000.00	1	{"transactionId":1179,"amount":"1000.00"}	2025-11-28 20:57:29.479293
952	\N	500	\N	service_updated	Serviço #500 atualizado	7	{"serviceId":500}	2025-11-28 21:05:10.569527
953	\N	500	\N	service_updated	Serviço #500 atualizado	7	{"serviceId":500}	2025-11-28 21:05:35.790016
954	\N	500	\N	service_updated	Serviço #500 atualizado	7	{"serviceId":500}	2025-11-28 21:05:43.179128
955	213	\N	\N	call_created	Chamado criado: 	7	\N	2025-11-28 21:06:11.291666
956	213	501	\N	converted_to_service	Chamado convertido em serviço: sdasdasdasdasdasdaasdsdaasd	7	\N	2025-11-28 21:06:28.262981
957	\N	500	\N	service_deleted	Serviço #500 deletado	7	{"serviceId":500}	2025-11-28 21:06:45.092999
958	213	501	\N	service_updated	Serviço #501 atualizado	7	{"serviceId":501}	2025-11-28 21:07:01.394678
959	213	501	\N	service_updated	Serviço #501 atualizado	7	{"serviceId":501}	2025-11-28 21:07:02.79017
960	213	501	1180	converted_to_financial	Serviço convertido para faturamento: sdasdasdasdasdasdaasdsdaasd	7	\N	2025-11-28 21:07:11.186386
961	213	501	\N	service_deleted	Serviço #501 deletado	7	{"serviceId":501}	2025-11-28 21:07:13.133979
962	\N	502	\N	service_created	Serviço criado: sdasdasdasdasdasdaasdsdaasd	7	\N	2025-11-28 21:07:23.917852
963	213	501	1180	transaction_deleted	Transação #1180 deletada - R$ 120.00	1	{"transactionId":1180,"amount":"120.00"}	2025-11-28 21:07:25.903791
964	\N	502	1181	converted_to_financial	Serviço convertido para faturamento: sdasdasdasdasdasdaasdsdaasd	7	\N	2025-11-28 21:07:43.117985
965	\N	502	\N	service_deleted	Serviço #502 deletado	7	{"serviceId":502}	2025-11-28 21:07:45.065187
966	214	\N	\N	call_created	Chamado criado: 	7	\N	2025-11-28 21:16:20.766553
967	214	503	\N	converted_to_service	Chamado convertido em serviço: sdaassdasdasdasdasdasdasdaasdasdsdasda	7	\N	2025-11-28 21:16:36.412236
968	214	503	\N	service_updated	Serviço #503 atualizado	7	{"serviceId":503}	2025-11-28 21:16:54.309467
969	214	503	1182	converted_to_financial	Serviço convertido para faturamento: sdaassdasdasdasdasdasdasdaasdasdsdasda	7	\N	2025-11-28 21:17:02.85346
970	214	503	\N	service_deleted	Serviço #503 deletado	7	{"serviceId":503}	2025-11-28 21:17:04.822167
971	\N	504	\N	service_created	Serviço criado: sdaassdasdasdasdasdasdasdaasdasdsdasda	7	\N	2025-11-28 21:17:16.776023
972	214	503	1182	transaction_deleted	Transação #1182 deletada - R$ 1500.00	1	{"transactionId":1182,"amount":"1500.00"}	2025-11-28 21:17:18.776484
973	\N	504	\N	service_deleted	Serviço #504 deletado	7	{"serviceId":504}	2025-11-28 21:19:05.626876
974	\N	502	1181	transaction_deleted	Transação #1181 deletada - R$ 120.00	7	{"transactionId":1181,"amount":"120.00"}	2025-11-28 21:19:09.507322
975	208	495	1178	transaction_deleted	Transação #1178 deletada - R$ 1000.00	7	{"transactionId":1178,"amount":"1000.00"}	2025-11-28 21:19:18.535307
976	215	\N	\N	call_created	Chamado criado: 	7	\N	2025-11-28 21:21:20.669638
977	215	505	\N	converted_to_service	Chamado convertido em serviço: jfgghfdhgfdhgfd	7	\N	2025-11-28 21:21:30.464901
978	215	505	\N	service_updated	Serviço #505 atualizado	7	{"serviceId":505}	2025-11-28 21:21:46.145163
979	215	505	1183	converted_to_financial	Serviço convertido para faturamento: jfgghfdhgfdhgfd	7	\N	2025-11-28 21:21:51.284348
980	215	505	\N	service_deleted	Serviço #505 deletado	7	{"serviceId":505}	2025-11-28 21:21:53.256003
981	\N	506	\N	service_created	Serviço criado: jfgghfdhgfdhgfd	7	\N	2025-11-28 21:22:02.363263
982	215	505	1183	transaction_deleted	Transação #1183 deletada - R$ 2000.00	1	{"transactionId":1183,"amount":"2000.00"}	2025-11-28 21:22:04.521674
983	\N	506	1184	converted_to_financial	Serviço convertido para faturamento: jfgghfdhgfdhgfd	7	\N	2025-11-28 21:35:19.350013
984	\N	506	\N	service_deleted	Serviço #506 deletado	7	{"serviceId":506}	2025-11-28 21:35:21.53208
985	\N	507	\N	service_created	Serviço criado: jfgghfdhgfdhgfd	7	\N	2025-11-28 21:35:30.224955
986	\N	506	1184	transaction_deleted	Transação #1184 deletada - R$ 2000.00	1	{"transactionId":1184,"amount":"2000.00"}	2025-11-28 21:35:32.228854
987	204	\N	\N	call_updated	Chamado #204 atualizado	7	{"callId":204}	2025-11-28 23:09:12.669492
988	106	\N	\N	call_updated	Chamado #106 atualizado	7	{"callId":106}	2025-11-28 23:09:40.037395
989	112	\N	\N	call_updated	Chamado #112 atualizado	7	{"callId":112}	2025-11-28 23:10:11.092037
990	\N	507	\N	service_deleted	Serviço #507 deletado	7	{"serviceId":507}	2025-11-28 23:10:38.093783
991	344	341	\N	service_updated	Serviço #341 atualizado	7	{"serviceId":341}	2025-11-28 23:11:05.58035
992	216	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-28 23:12:11.056595
993	216	\N	\N	call_updated	Chamado #216 atualizado	1	{"callId":216}	2025-11-28 23:12:41.65874
994	216	508	\N	converted_to_service	Chamado convertido em serviço: Ksjdjhdhdhsjsjjsjsj	10	\N	2025-11-28 23:12:48.676969
995	216	508	\N	service_updated	Serviço #508 atualizado	10	{"serviceId":508}	2025-11-28 23:13:06.234154
996	216	508	\N	service_updated	Serviço #508 atualizado	10	{"serviceId":508}	2025-11-28 23:13:33.706714
997	216	508	\N	service_updated	Serviço #508 atualizado	10	{"serviceId":508}	2025-11-28 23:13:46.99949
998	216	508	1185	converted_to_financial	Serviço convertido para faturamento: Ksjdjhdhdhsjsjjsjsj	10	\N	2025-11-28 23:14:09.598742
999	216	508	\N	service_deleted	Serviço #508 deletado	1	{"serviceId":508}	2025-11-28 23:14:11.702135
1000	112	\N	\N	call_updated	Chamado #112 atualizado	1	{"callId":112}	2025-11-29 10:00:00.358435
1001	112	\N	\N	call_updated	Chamado #112 atualizado	1	{"callId":112}	2025-11-29 10:00:16.215403
1002	217	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-29 10:10:18.437291
1003	217	\N	\N	call_updated	Chamado #217 atualizado	1	{"callId":217}	2025-11-29 10:10:34.650991
1004	217	\N	\N	call_updated	Chamado #217 atualizado	1	{"callId":217}	2025-11-29 10:10:43.38791
1005	217	509	\N	converted_to_service	Chamado convertido em serviço: Ksjdjsjsjs	1	\N	2025-11-29 10:10:49.261534
1006	112	\N	\N	call_updated	Chamado #112 atualizado	1	{"callId":112}	2025-11-29 10:11:00.09569
1007	112	\N	\N	call_updated	Chamado #112 atualizado	1	{"callId":112}	2025-11-29 10:11:09.404723
1008	104	\N	\N	call_updated	Chamado #104 atualizado	1	{"callId":104}	2025-11-29 10:13:53.412513
1009	217	509	\N	service_updated	Serviço #509 atualizado	1	{"serviceId":509}	2025-11-29 10:14:31.23997
1010	217	509	\N	service_updated	Serviço #509 atualizado	1	{"serviceId":509}	2025-11-29 10:14:50.860337
1011	217	509	\N	service_updated	Serviço #509 atualizado	1	{"serviceId":509}	2025-11-29 10:17:17.527873
1012	344	341	\N	service_updated	Serviço #341 atualizado	5	{"serviceId":341}	2025-11-29 10:17:41.392726
1013	337	337	\N	service_updated	Serviço #337 atualizado	5	{"serviceId":337}	2025-11-29 10:17:52.074109
1014	313	344	\N	service_updated	Serviço #344 atualizado	5	{"serviceId":344}	2025-11-29 10:18:05.945659
1015	331	359	\N	service_updated	Serviço #359 atualizado	5	{"serviceId":359}	2025-11-29 10:18:16.038565
1016	295	308	\N	service_updated	Serviço #308 atualizado	5	{"serviceId":308}	2025-11-29 10:18:29.076597
1017	280	291	\N	service_updated	Serviço #291 atualizado	5	{"serviceId":291}	2025-11-29 10:18:40.273968
1018	353	348	\N	service_updated	Serviço #348 atualizado	5	{"serviceId":348}	2025-11-29 10:18:51.620861
1019	\N	242	\N	service_updated	Serviço #242 atualizado	5	{"serviceId":242}	2025-11-29 10:19:03.322506
1020	\N	157	\N	service_updated	Serviço #157 atualizado	5	{"serviceId":157}	2025-11-29 10:19:29.09236
1021	216	508	1185	transaction_deleted	Transação #1185 deletada - R$ 8000.00	1	{"transactionId":1185,"amount":"8000.00"}	2025-11-29 10:48:00.317771
1022	200	483	1171	payment_received	Pagamento recebido: Instalação do sistema operacional máquina nova.	1	\N	2025-11-29 10:48:47.700444
1023	217	509	\N	service_updated	Serviço #509 atualizado	1	{"serviceId":509}	2025-11-29 10:50:30.207996
1024	217	509	\N	service_updated	Serviço #509 atualizado	1	{"serviceId":509}	2025-11-29 10:50:44.10253
1025	217	509	\N	service_deleted	Serviço #509 deletado	1	{"serviceId":509}	2025-11-29 10:50:55.070366
1026	218	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-29 10:57:17.437718
1027	218	\N	\N	call_updated	Chamado #218 atualizado	1	{"callId":218}	2025-11-29 10:57:35.720149
1028	218	510	\N	converted_to_service	Chamado convertido em serviço: Ucufudufufufufufufufff	7	\N	2025-11-29 10:57:45.093096
1029	218	510	\N	service_updated	Serviço #510 atualizado	7	{"serviceId":510}	2025-11-29 10:57:58.703942
1030	218	510	1186	converted_to_financial	Serviço convertido para faturamento: Ucufudufufufufufufufff	7	\N	2025-11-29 10:58:11.422618
1031	218	510	\N	service_deleted	Serviço #510 deletado	1	{"serviceId":510}	2025-11-29 10:58:13.324726
1032	218	510	1186	transaction_deleted	Transação #1186 deletada - R$ 100.00	1	{"transactionId":1186,"amount":"100.00"}	2025-11-29 10:58:35.813408
1033	219	\N	\N	call_created	Chamado criado: 	1	\N	2025-11-30 02:01:12.050644
1034	219	511	\N	converted_to_service	Chamado convertido em serviço: sadsadasdasdasdas	1	\N	2025-11-30 02:01:18.115149
1035	219	511	1187	converted_to_financial	Serviço convertido para faturamento: sadsadasdasdasdas	1	\N	2025-11-30 02:01:30.609196
1036	219	511	\N	service_deleted	Serviço #511 deletado	1	{"serviceId":511}	2025-11-30 02:01:32.531835
1037	220	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-01 18:26:29.186873
1039	220	512	\N	converted_to_service	Chamado convertido em serviço: Trocar Dcjack e carregador. Reconstrução na carcaça e manutenção das dobradiças. 	9	\N	2025-12-01 18:29:38.211891
1041	201	487	\N	service_deleted	Serviço #487 deletado	9	{"serviceId":487}	2025-12-01 19:04:32.989887
1043	222	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-01 20:25:48.893855
1045	223	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-01 20:26:43.096241
1049	\N	\N	\N	client_created	Cliente Loja 3D Baraúnas criado	9	{"clientId":153,"clientName":"Loja 3D Baraúnas"}	2025-12-01 20:27:36.520913
1051	227	\N	\N	call_created	Chamado criado: 	1	\N	2025-12-01 20:43:58.057204
1052	\N	\N	\N	client_created	Cliente aaaaaaghfjghjhfjhgfjhjf criado	1	{"clientId":154,"clientName":"aaaaaaghfjghjhfjhgfjhjf"}	2025-12-01 20:43:58.912567
1054	\N	\N	\N	client_created	Cliente aaaaaaaa criado	1	{"clientId":155,"clientName":"aaaaaaaa"}	2025-12-01 20:47:52.056081
1057	\N	\N	\N	client_created	Cliente sda sda criado	1	{"clientId":157,"clientName":"sda sda"}	2025-12-01 21:07:16.919051
1060	231	\N	\N	call_created	Chamado criado: 	1	\N	2025-12-01 21:15:29.564399
1061	\N	\N	\N	client_created	Cliente aaaaaaaaaaaaaaaaaaaaaaaaaaaa criado	1	{"clientId":159,"clientName":"aaaaaaaaaaaaaaaaaaaaaaaaaaaa"}	2025-12-01 21:15:30.522784
1064	233	\N	\N	call_created	Chamado criado: 	1	\N	2025-12-01 21:18:43.218587
1065	\N	\N	\N	client_created	Cliente aa111 criado	1	{"clientId":161,"clientName":"aa111"}	2025-12-01 21:18:44.112526
1068	235	\N	\N	call_created	Chamado criado: 	1	\N	2025-12-01 21:27:11.567593
1069	\N	\N	\N	client_created	Cliente aa22222 criado	1	{"clientId":163,"clientName":"aa22222"}	2025-12-01 21:27:12.405982
1072	237	\N	\N	call_created	Chamado criado: 	1	\N	2025-12-01 21:36:56.27756
1074	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 22:52:49.676032
1076	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:01:23.718415
1079	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:06:17.80978
1081	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:08:58.851168
1083	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:11:39.087411
1085	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:13:45.158467
1086	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:14:00.147322
1089	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:32:33.057929
1091	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:44:19.353691
1093	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:52:13.255824
1094	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:52:32.399767
1096	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:55:03.800982
1099	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-02 00:03:12.774502
1101	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-02 00:04:18.899194
1103	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-02 00:11:16.298593
1105	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-02 00:18:58.136039
1106	\N	\N	\N	client_deleted	Cliente aaaaaaaa deletado	1	{"clientId":155,"clientName":"aaaaaaaa"}	2025-12-02 11:56:32.174647
1107	\N	\N	\N	client_deleted	Cliente 11111111 deletado	1	{"clientId":147,"clientName":"11111111"}	2025-12-02 11:56:41.736217
1109	\N	\N	\N	client_deleted	Cliente a1451 deletado	1	{"clientId":164,"clientName":"a1451"}	2025-12-02 11:57:00.237636
1110	\N	\N	\N	client_deleted	Cliente aa111 deletado	1	{"clientId":161,"clientName":"aa111"}	2025-12-02 11:57:06.013225
1111	\N	\N	\N	client_deleted	Cliente aa22222 deletado	1	{"clientId":163,"clientName":"aa22222"}	2025-12-02 11:57:10.05375
1112	\N	\N	\N	client_deleted	Cliente aaaaaaaaaaa11111 deletado	1	{"clientId":160,"clientName":"aaaaaaaaaaa11111"}	2025-12-02 11:57:14.150885
1113	\N	\N	\N	client_deleted	Cliente aaaaaaaaaaaaaaaaaaaaa deletado	1	{"clientId":156,"clientName":"aaaaaaaaaaaaaaaaaaaaa"}	2025-12-02 11:57:18.336565
1114	\N	\N	\N	client_deleted	Cliente aaaaaafdsgfdsfdsfdfdsfgd deletado	1	{"clientId":158,"clientName":"aaaaaafdsgfdsfdsfdfdsfgd"}	2025-12-02 11:57:25.322292
1115	\N	\N	\N	client_deleted	Cliente aaaaaaaaaaaaaaaaaaaaaaaaaaaa deletado	1	{"clientId":159,"clientName":"aaaaaaaaaaaaaaaaaaaaaaaaaaaa"}	2025-12-02 11:57:31.253889
1116	\N	\N	\N	client_deleted	Cliente aaaaaaghfjghjhfjhgfjhjf deletado	1	{"clientId":154,"clientName":"aaaaaaghfjghjhfjhgfjhjf"}	2025-12-02 11:57:35.250819
1118	177	513	\N	converted_to_service	Chamado convertido em serviço: Máquina de Célia com pouca memória. 	9	\N	2025-12-02 12:20:07.747664
1120	223	514	\N	converted_to_service	Chamado convertido em serviço: Acesso remoto para instalar pacote office.	9	\N	2025-12-02 12:20:52.465213
1121	226	515	\N	converted_to_service	Chamado convertido em serviço: Acesso remoto para configurar impressora.	9	\N	2025-12-02 12:20:58.521145
1122	237	\N	\N	call_deleted	Chamado #237 deletado	9	{"callId":237}	2025-12-02 12:21:09.162904
1124	241	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-02 12:25:44.413357
1126	243	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-02 12:26:49.151006
1129	226	515	\N	service_updated	Serviço #515 atualizado	7	{"serviceId":515}	2025-12-02 12:39:18.503956
1130	226	515	\N	service_updated	Serviço #515 atualizado	7	{"serviceId":515}	2025-12-02 12:39:19.118039
1132	220	512	\N	service_updated	Serviço #512 atualizado	7	{"serviceId":512}	2025-12-02 13:36:22.055174
1134	220	512	\N	service_updated	Serviço #512 atualizado	7	{"serviceId":512}	2025-12-02 13:36:55.514514
1135	226	515	\N	service_updated	Serviço #515 atualizado	1	{"serviceId":515}	2025-12-02 15:33:08.633865
1137	226	515	\N	service_updated	Serviço #515 atualizado	1	{"serviceId":515}	2025-12-02 15:51:52.237775
1138	226	515	\N	service_updated	Serviço #515 atualizado	1	{"serviceId":515}	2025-12-02 15:52:02.165702
1140	221	516	\N	service_updated	Serviço #516 atualizado	1	{"serviceId":516}	2025-12-02 17:36:05.829342
1143	221	516	1188	discount_applied	Desconto de R$ 20,00 aplicado à transação #1188	1	{"transactionId":1188,"discount":20,"originalAmount":200,"newAmount":180}	2025-12-02 17:36:45.013268
1144	\N	262	425	transaction_deleted	Transação #425 deletada - R$ 80.00	1	{"transactionId":425,"amount":"80.00"}	2025-12-02 20:30:08.536958
1149	240	\N	\N	call_updated	Chamado #240 atualizado	1	{"callId":240}	2025-12-02 20:54:27.806052
1151	100	400	\N	service_updated	Serviço #400 atualizado	1	{"serviceId":400}	2025-12-02 20:56:20.221957
1152	\N	\N	1189	converted_to_financial	Serviço convertido para faturamento: 7x fontes ATX mercado livre	1	\N	2025-12-03 07:00:55.284717
1038	221	\N	\N	call_created	Chamado criado: 	1	\N	2025-12-01 18:27:08.699146
1040	220	512	\N	service_updated	Serviço #512 atualizado	9	{"serviceId":512}	2025-12-01 18:36:09.49551
1042	221	\N	\N	call_updated	Chamado #221 atualizado	1	{"callId":221}	2025-12-01 20:19:50.545148
1044	\N	\N	\N	client_created	Cliente Loja 3D Serra do Mel criado	9	{"clientId":151,"clientName":"Loja 3D Serra do Mel"}	2025-12-01 20:25:49.99131
1046	224	\N	\N	call_created	Chamado criado: 	1	\N	2025-12-01 20:27:14.676859
1047	\N	\N	\N	client_created	Cliente Testestestes criado	1	{"clientId":152,"clientName":"Testestestes"}	2025-12-01 20:27:15.455373
1048	225	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-01 20:27:35.182637
1050	226	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-01 20:28:11.570834
1053	228	\N	\N	call_created	Chamado criado: 	1	\N	2025-12-01 20:47:50.893276
1055	229	\N	\N	call_created	Chamado criado: 	1	\N	2025-12-01 21:00:37.898164
1056	\N	\N	\N	client_created	Cliente aaaaaaaaaaaaaaaaaaaaa criado	1	{"clientId":156,"clientName":"aaaaaaaaaaaaaaaaaaaaa"}	2025-12-01 21:00:38.852622
1058	230	\N	\N	call_created	Chamado criado: 	1	\N	2025-12-01 21:11:09.664767
1059	\N	\N	\N	client_created	Cliente aaaaaafdsgfdsfdsfdfdsfgd criado	1	{"clientId":158,"clientName":"aaaaaafdsgfdsfdsfdfdsfgd"}	2025-12-01 21:11:10.618478
1062	232	\N	\N	call_created	Chamado criado: 	1	\N	2025-12-01 21:15:59.977928
1063	\N	\N	\N	client_created	Cliente aaaaaaaaaaa11111 criado	1	{"clientId":160,"clientName":"aaaaaaaaaaa11111"}	2025-12-01 21:16:00.897258
1066	234	\N	\N	call_created	Chamado criado: 	1	\N	2025-12-01 21:20:28.171034
1067	\N	\N	\N	client_created	Cliente a111111111 criado	1	{"clientId":162,"clientName":"a111111111"}	2025-12-01 21:20:28.92847
1070	\N	\N	\N	client_created	Cliente a1451 criado	1	{"clientId":164,"clientName":"a1451"}	2025-12-01 21:30:29.74238
1071	236	\N	\N	call_created	Chamado criado: 	1	\N	2025-12-01 21:30:39.765556
1073	236	\N	\N	call_deleted	Chamado #236 deletado	1	{"callId":236}	2025-12-01 22:34:33.609904
1075	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 22:57:25.74638
1077	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:02:05.685881
1078	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:02:06.147182
1080	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:08:38.536252
1082	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:09:40.005676
1084	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:12:10.203601
1087	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:16:35.683359
1088	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:16:47.373794
1090	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:33:11.993232
1092	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:48:14.775454
1095	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-01 23:54:49.293611
1097	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-02 00:00:18.246047
1098	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-02 00:00:35.847916
1100	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-02 00:03:30.724447
1102	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-02 00:05:11.050669
1104	220	512	\N	service_updated	Serviço #512 atualizado	1	{"serviceId":512}	2025-12-02 00:11:44.170314
1108	\N	\N	\N	client_deleted	Cliente a111111111 deletado	1	{"clientId":162,"clientName":"a111111111"}	2025-12-02 11:56:55.690504
1117	238	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-02 12:14:00.656061
1119	239	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-02 12:20:35.042506
1123	240	\N	\N	call_created	Chamado criado: 	1	\N	2025-12-02 12:24:53.723841
1125	242	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-02 12:26:12.135336
1127	\N	\N	\N	client_created	Cliente E. E. Manoel Justiniano criado	9	{"clientId":165,"clientName":"E. E. Manoel Justiniano"}	2025-12-02 12:30:23.876579
1128	244	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-02 12:30:32.637599
1131	226	515	\N	service_updated	Serviço #515 atualizado	7	{"serviceId":515}	2025-12-02 12:44:28.448355
1133	220	512	\N	service_updated	Serviço #512 atualizado	7	{"serviceId":512}	2025-12-02 13:36:55.439098
1136	226	515	\N	service_updated	Serviço #515 atualizado	1	{"serviceId":515}	2025-12-02 15:33:18.834156
1139	221	516	\N	converted_to_service	Chamado convertido em serviço: Fonte ATX queimada	1	\N	2025-12-02 15:52:40.965718
1141	221	516	1188	converted_to_financial	Serviço convertido para faturamento: Fonte ATX queimada	1	\N	2025-12-02 17:36:18.908568
1142	221	516	\N	service_deleted	Serviço #516 deletado	1	{"serviceId":516}	2025-12-02 17:36:20.994659
1145	221	516	1188	payment_received	Pagamento recebido: Fonte ATX queimada	1	\N	2025-12-02 20:31:37.358301
1146	\N	403	1096	payment_received	Pagamento recebido: Reparo no no-break do alarme e internet	1	\N	2025-12-02 20:31:45.117926
1147	\N	482	1168	payment_received	Pagamento recebido: Visita técnica para fazer instalação de Switch e ajustes na rede, garantindo que todos os computadores da clínica tenham internet e acesso ao sistema Doctors	1	\N	2025-12-02 20:31:50.261511
1148	\N	433	1097	payment_received	Pagamento recebido: CPU Dell 3010 8gb RAM SSD 128gb + HD 320gb	1	\N	2025-12-02 20:31:54.455366
1150	226	515	\N	service_updated	Serviço #515 atualizado	1	{"serviceId":515}	2025-12-02 20:55:24.432199
1153	\N	\N	1189	payment_received	Pagamento recebido: 7x fontes ATX mercado livre	1	\N	2025-12-03 07:01:12.331587
1240	259	\N	\N	call_created	Chamado criado: 	1	\N	2025-12-10 22:19:54.367641
1154	\N	517	\N	service_created	Serviço criado: Ativação pacote office recepção.	9	\N	2025-12-03 12:17:40.722795
1155	\N	517	\N	service_updated	Serviço #517 atualizado	9	{"serviceId":517}	2025-12-03 12:18:33.79474
1156	\N	517	1190	converted_to_financial	Serviço convertido para faturamento: Ativação pacote office recepção.	9	\N	2025-12-03 12:18:42.127617
1157	\N	517	\N	service_deleted	Serviço #517 deletado	9	{"serviceId":517}	2025-12-03 12:18:44.049591
1158	226	515	\N	service_updated	Serviço #515 atualizado	9	{"serviceId":515}	2025-12-03 12:19:29.067778
1159	226	515	1191	converted_to_financial	Serviço convertido para faturamento: Acesso remoto para configurar impressora.	9	\N	2025-12-03 12:19:36.986032
1160	226	515	\N	service_deleted	Serviço #515 deletado	9	{"serviceId":515}	2025-12-03 12:19:38.887995
1161	223	514	\N	service_updated	Serviço #514 atualizado	9	{"serviceId":514}	2025-12-03 12:20:28.471262
1162	223	514	1192	converted_to_financial	Serviço convertido para faturamento: Acesso remoto para instalar pacote office.	9	\N	2025-12-03 12:20:36.339657
1163	223	514	\N	service_deleted	Serviço #514 deletado	9	{"serviceId":514}	2025-12-03 12:20:38.204853
1164	177	513	\N	service_updated	Serviço #513 atualizado	9	{"serviceId":513}	2025-12-03 12:22:49.924975
1165	177	513	\N	service_updated	Serviço #513 atualizado	9	{"serviceId":513}	2025-12-03 12:23:07.945487
1166	177	513	1193	converted_to_financial	Serviço convertido para faturamento: Máquina de Célia com pouca memória. 	9	\N	2025-12-03 12:23:17.073106
1167	177	513	\N	service_deleted	Serviço #513 deletado	9	{"serviceId":513}	2025-12-03 12:23:18.973724
1168	176	484	\N	service_updated	Serviço #484 atualizado	9	{"serviceId":484}	2025-12-03 12:24:10.09896
1169	176	484	1194	converted_to_financial	Serviço convertido para faturamento: Desktop Adryelle com barulho. Fazer limpeza. 	9	\N	2025-12-03 12:24:22.950758
1170	176	484	\N	service_deleted	Serviço #484 deletado	9	{"serviceId":484}	2025-12-03 12:24:24.929903
1171	344	341	\N	service_deleted	Serviço #341 deletado	9	{"serviceId":341}	2025-12-03 12:24:59.621025
1172	245	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-03 12:29:21.592164
1173	246	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-03 12:29:54.846636
1174	\N	\N	\N	client_created	Cliente Fátima Días - Martins criado	9	{"clientId":166,"clientName":"Fátima Días - Martins"}	2025-12-03 13:17:25.254638
1175	247	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-03 13:18:51.973341
1176	\N	518	\N	service_created	Serviço criado: Ajustes nos sistemas de câmeras de Upanema e Mossoró	1	\N	2025-12-03 15:07:06.827393
1177	\N	343	513	transaction_deleted	Transação #513 deletada - R$ 150.00	1	{"transactionId":513,"amount":"150.00"}	2025-12-03 15:07:08.518484
1178	\N	518	\N	service_updated	Serviço #518 atualizado	1	{"serviceId":518}	2025-12-03 15:07:26.315606
1179	\N	518	1195	converted_to_financial	Serviço convertido para faturamento: Ajustes nos sistemas de câmeras de Upanema e Mossoró	1	\N	2025-12-03 15:07:33.297569
1180	\N	518	\N	service_deleted	Serviço #518 deletado	1	{"serviceId":518}	2025-12-03 15:07:34.946722
1181	\N	519	\N	service_created	Serviço criado: Ajustes nos sistemas de câmeras de Upanema e Mossoró	1	\N	2025-12-03 15:08:09.030037
1182	\N	518	1195	transaction_deleted	Transação #1195 deletada - R$ 100.00	1	{"transactionId":1195,"amount":"100.00"}	2025-12-03 15:08:10.79371
1183	\N	519	\N	service_updated	Serviço #519 atualizado	1	{"serviceId":519}	2025-12-03 15:08:56.003835
1184	\N	519	1196	converted_to_financial	Serviço convertido para faturamento: Ajustes nos sistemas de câmeras de Upanema e Mossoró	1	\N	2025-12-03 15:09:11.102897
1185	\N	519	\N	service_deleted	Serviço #519 deletado	1	{"serviceId":519}	2025-12-03 15:09:13.653399
1186	105	452	\N	service_updated	Serviço #452 atualizado	5	{"serviceId":452}	2025-12-03 21:25:41.255445
1187	108	445	\N	service_updated	Serviço #445 atualizado	5	{"serviceId":445}	2025-12-03 21:26:50.105589
1188	\N	\N	107	transaction_deleted	Transação #107 deletada - R$ 2700.00	1	{"transactionId":107,"amount":"2700.00"}	2025-12-03 21:31:25.054967
1189	\N	75	75	payment_received	Pagamento recebido: Retorno PC na assistência\n\nDiscriminação de valores:\n\nServiços:\n- Retorno PC na assistência: R$ 10,00\n\n[{"name":"Retorno PC na assistência","amount":10,"type":"servico"}]	1	\N	2025-12-04 11:08:19.90349
1190	\N	134	\N	service_deleted	Serviço #134 deletado	1	{"serviceId":134}	2025-12-04 11:10:11.066434
1191	\N	478	1164	payment_received	Pagamento recebido: Computador parou de ligar	1	\N	2025-12-04 11:11:31.406613
1192	248	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-04 13:29:33.54584
1193	\N	\N	\N	client_created	Cliente Taciana criado	9	{"clientId":167,"clientName":"Taciana"}	2025-12-04 16:32:07.001015
1194	249	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-04 16:32:16.594254
1195	\N	\N	1197	converted_to_financial	Serviço convertido para faturamento: Gift card Júnior Mendonça ativação Google drive	1	\N	2025-12-05 09:23:47.171746
1196	\N	\N	1197	payment_received	Pagamento recebido: Gift card Júnior Mendonça ativação Google drive	1	\N	2025-12-05 09:24:01.030156
1197	\N	\N	\N	client_created	Cliente Ariana França criado	9	{"clientId":168,"clientName":"Ariana França"}	2025-12-05 13:14:19.616794
1198	250	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-05 13:14:31.977173
1199	\N	\N	\N	client_created	Cliente Juscileide Nitinha criado	9	{"clientId":169,"clientName":"Juscileide Nitinha"}	2025-12-05 13:21:07.49031
1200	251	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-05 13:26:11.002585
1201	249	520	\N	converted_to_service	Chamado convertido em serviço: Orçamento passagem do cabo 	9	\N	2025-12-05 14:08:46.433796
1202	249	520	\N	service_updated	Serviço #520 atualizado	9	{"serviceId":520}	2025-12-05 15:11:41.092236
1203	249	520	\N	service_updated	Serviço #520 atualizado	9	{"serviceId":520}	2025-12-05 15:11:42.07566
1204	249	520	\N	service_updated	Serviço #520 atualizado	9	{"serviceId":520}	2025-12-05 15:13:00.637909
1205	\N	\N	\N	client_created	Cliente Balão do Dia criado	9	{"clientId":170,"clientName":"Balão do Dia"}	2025-12-05 15:30:48.598959
1206	252	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-05 15:31:59.596365
1207	253	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-05 20:58:43.319513
1208	254	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-05 20:58:59.38175
1209	\N	521	\N	service_created	Serviço criado: Reparo no nobreak do servidor	1	\N	2025-12-09 10:05:41.781047
1210	\N	522	\N	service_created	Serviço criado: Reparo no nobreak do servidor	1	\N	2025-12-09 10:07:01.759643
1211	255	\N	\N	call_created	Chamado criado: 	1	\N	2025-12-09 12:34:44.919764
1212	249	520	1198	converted_to_financial	Serviço convertido para faturamento: Orçamento passagem do cabo 	9	\N	2025-12-09 13:44:40.06822
1213	249	520	\N	service_deleted	Serviço #520 deletado	9	{"serviceId":520}	2025-12-09 13:44:42.195221
1214	220	512	\N	service_updated	Serviço #512 atualizado	9	{"serviceId":512}	2025-12-09 13:45:09.972796
1215	\N	\N	\N	client_created	Cliente Taffarel Maia criado	9	{"clientId":171,"clientName":"Taffarel Maia"}	2025-12-09 14:05:16.333019
1216	256	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-09 14:05:19.14555
1217	257	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-09 14:07:28.760896
1218	106	\N	\N	call_deleted	Chamado #106 deletado	9	{"callId":106}	2025-12-09 14:10:50.573043
1219	248	\N	\N	call_deleted	Chamado #248 deletado	9	{"callId":248}	2025-12-09 18:52:54.669002
1220	252	\N	\N	call_deleted	Chamado #252 deletado	9	{"callId":252}	2025-12-09 18:53:39.810915
1221	\N	523	\N	service_created	Serviço criado: teste	1	\N	2025-12-10 12:20:04.457636
1222	\N	524	\N	service_created	Serviço criado: teste	1	\N	2025-12-10 12:22:26.71432
1223	\N	525	\N	service_created	Serviço criado: teste	1	\N	2025-12-10 12:26:03.872328
1224	\N	525	\N	service_deleted	Serviço #525 deletado	1	{"serviceId":525}	2025-12-10 12:31:11.94749
1225	\N	524	\N	service_deleted	Serviço #524 deletado	1	{"serviceId":524}	2025-12-10 12:31:19.543973
1226	\N	523	\N	service_deleted	Serviço #523 deletado	1	{"serviceId":523}	2025-12-10 12:31:25.215133
1227	\N	441	\N	service_deleted	Serviço #441 deletado	1	{"serviceId":441}	2025-12-10 12:32:44.079045
1228	\N	476	\N	service_deleted	Serviço #476 deletado	1	{"serviceId":476}	2025-12-10 12:32:52.080774
1229	\N	\N	1199	converted_to_financial	Serviço convertido para faturamento: testes	1	\N	2025-12-10 12:34:09.576058
1230	\N	\N	1199	payment_received	Pagamento recebido: testes	1	\N	2025-12-10 12:34:28.8211
1231	\N	\N	1199	transaction_deleted	Transação #1199 deletada - R$ 1000.00	1	{"transactionId":1199,"amount":"1000.00"}	2025-12-10 12:37:34.388306
1232	\N	\N	1200	payment_received	Pagamento recebido: asdsadsadsadsa	1	\N	2025-12-10 12:37:50.884666
1233	\N	\N	1200	transaction_deleted	Transação #1200 deletada - R$ 12222.00	1	{"transactionId":1200,"amount":"12222.00"}	2025-12-10 12:49:46.506143
1234	240	\N	\N	call_updated	Chamado #240 atualizado	1	{"callId":240}	2025-12-10 17:18:57.511128
1235	258	\N	\N	call_created	Chamado criado: 	1	\N	2025-12-10 17:19:36.055489
1236	258	526	\N	converted_to_service	Chamado convertido em serviço: PC Janaíne parou de funcionar após queda de energia	1	\N	2025-12-10 17:19:43.374474
1237	258	526	\N	service_updated	Serviço #526 atualizado	1	{"serviceId":526}	2025-12-10 17:22:31.117341
1238	258	526	1201	converted_to_financial	Serviço convertido para faturamento: PC Janaíne parou de funcionar após queda de energia	1	\N	2025-12-10 17:22:44.983017
1239	258	526	\N	service_deleted	Serviço #526 deletado	1	{"serviceId":526}	2025-12-10 17:22:46.861818
1241	240	527	\N	converted_to_service	Chamado convertido em serviço: Computador balcão do canto está se desligando e muito lento, travando. Impressora HP dando erro no toner. HP p1102w.	1	\N	2025-12-10 22:21:11.842691
1242	240	527	\N	service_updated	Serviço #527 atualizado	1	{"serviceId":527}	2025-12-10 22:22:10.721138
1243	240	527	\N	service_updated	Serviço #527 atualizado	1	{"serviceId":527}	2025-12-10 22:22:38.362434
1244	\N	522	\N	service_deleted	Serviço #522 deletado	1	{"serviceId":522}	2025-12-10 22:23:26.477308
1245	240	527	\N	service_updated	Serviço #527 atualizado	1	{"serviceId":527}	2025-12-11 02:59:25.322076
1246	\N	521	\N	service_updated	Serviço #521 atualizado	1	{"serviceId":521}	2025-12-11 02:59:35.716041
1247	\N	521	\N	service_updated	Serviço #521 atualizado	1	{"serviceId":521}	2025-12-11 03:00:03.730431
1248	\N	\N	\N	client_created	Cliente Maycon Crynos criado	1	{"clientId":172,"clientName":"Maycon Crynos"}	2025-12-11 20:55:33.239931
1249	260	\N	\N	call_created	Chamado criado: 	1	\N	2025-12-11 20:55:54.602036
1250	260	528	\N	converted_to_service	Chamado convertido em serviço: CPU gamer liga mas não dá vídeo	1	\N	2025-12-11 20:56:01.617342
1251	260	528	\N	service_updated	Serviço #528 atualizado	1	{"serviceId":528}	2025-12-11 20:56:44.035393
1252	260	528	\N	service_updated	Serviço #528 atualizado	1	{"serviceId":528}	2025-12-11 20:57:08.743823
1253	260	528	\N	service_updated	Serviço #528 atualizado	1	{"serviceId":528}	2025-12-11 20:57:59.651672
1254	260	528	\N	service_updated	Serviço #528 atualizado	1	{"serviceId":528}	2025-12-11 20:59:31.330805
1255	257	529	\N	converted_to_service	Chamado convertido em serviço: Fonte ATX, Fonte IMP cupom, Roteador W6.\n\nBackup e baixa Pc. 	9	\N	2025-12-13 01:44:39.437563
1256	257	529	\N	service_updated	Serviço #529 atualizado	9	{"serviceId":529}	2025-12-13 02:07:04.114726
1257	108	445	\N	service_updated	Serviço #445 atualizado	9	{"serviceId":445}	2025-12-13 02:11:28.166386
1258	108	445	1202	converted_to_financial	Serviço convertido para faturamento: Problema mouse para e upgrade de memória	5	\N	2025-12-13 02:11:37.363005
1259	108	445	\N	service_deleted	Serviço #445 deletado	9	{"serviceId":445}	2025-12-13 02:11:39.336287
1260	105	452	\N	service_updated	Serviço #452 atualizado	9	{"serviceId":452}	2025-12-13 02:15:50.876535
1261	105	452	1203	converted_to_financial	Serviço convertido para faturamento: Obra medical center. Desmontagem e passagem dos novos cabos para efetuar obra. Remontagem de equipamentos após obra. Só falta agora colocar as 4 câmeras pra funcionar. Foram usados 200 metros de cabo. 2 canaletas. 4 câmeras recepção e faixada.	5	\N	2025-12-13 02:16:33.903429
1262	105	452	\N	service_deleted	Serviço #452 deletado	9	{"serviceId":452}	2025-12-13 02:16:35.854453
1263	108	445	1202	payment_received	Pagamento recebido: Problema mouse para e upgrade de memória	9	\N	2025-12-13 02:19:27.120722
1264	249	520	1198	discount_applied	Desconto de R$ 73,00 aplicado à transação #1198	9	{"transactionId":1198,"discount":73,"originalAmount":623,"newAmount":550}	2025-12-13 02:20:27.801383
1265	249	520	1198	payment_received	Pagamento recebido: Orçamento passagem do cabo 	9	\N	2025-12-13 02:20:37.947679
1266	177	513	1193	payment_received	Pagamento recebido: Máquina de Célia com pouca memória. 	9	\N	2025-12-13 02:21:01.751662
1267	223	514	1192	payment_received	Pagamento recebido: Acesso remoto para instalar pacote office.	9	\N	2025-12-13 02:21:27.04471
1268	141	\N	162	payment_received	Pagamento recebido: Parcela 5/5 - Manutenção preventiva de todas as máquinas das 3 lojas. 	9	\N	2025-12-13 02:21:46.699281
1269	142	\N	167	payment_received	Pagamento recebido: Parcela 5/5 - Desktop completo para recepção João da Escóssia.	9	\N	2025-12-13 02:21:54.957655
1270	\N	66	172	payment_received	Pagamento recebido: Parcela 5/5 - Roteador Intelbras configurado com a rede clientes na João da Escóssia.\n\nDiscriminação de valores:\n\nProdutos/Materiais:\n- Roteador Intelbras configurado com a rede clientes na João da Escóssia. : R$ 150,00\n\n[{"name":"Roteador Intelbras configurado com a rede clientes na João da Escóssia. ","amount":150,"type":"produto"}]	9	\N	2025-12-13 02:22:01.342709
1271	226	515	1191	payment_received	Pagamento recebido: Acesso remoto para configurar impressora.	9	\N	2025-12-13 02:22:10.700361
1272	257	529	1209	converted_to_financial	Serviço convertido para faturamento: Fonte ATX, Fonte IMP cupom, Roteador W6.\n\nBackup e baixa Pc. 	9	\N	2025-12-13 02:22:45.900455
1273	257	529	\N	service_deleted	Serviço #529 deletado	9	{"serviceId":529}	2025-12-13 02:22:47.879697
1274	100	400	\N	service_updated	Serviço #400 atualizado	9	{"serviceId":400}	2025-12-13 02:29:34.841569
1275	100	400	1210	converted_to_financial	Serviço convertido para faturamento: Visita técnica para organização dos equipamentos de rede no hack principal e ajustes na configuração do Mikrotik routerboard	1	\N	2025-12-13 02:30:23.696232
1276	100	400	\N	service_deleted	Serviço #400 deletado	9	{"serviceId":400}	2025-12-13 02:30:25.716289
1277	\N	530	\N	service_created	Serviço criado: Mikrotik Failover e Loadbalance.	9	\N	2025-12-13 02:31:25.278828
1278	\N	530	\N	service_updated	Serviço #530 atualizado	9	{"serviceId":530}	2025-12-13 02:32:35.946293
1279	220	512	1211	converted_to_financial	Serviço convertido para faturamento: Trocar Dcjack e carregador. Reconstrução na carcaça e manutenção das dobradiças. 	9	\N	2025-12-13 02:34:44.391013
1280	220	512	\N	service_deleted	Serviço #512 deletado	9	{"serviceId":512}	2025-12-13 02:34:46.31843
1281	337	337	\N	service_updated	Serviço #337 atualizado	9	{"serviceId":337}	2025-12-13 02:36:33.146137
1282	337	337	1212	converted_to_financial	Serviço convertido para faturamento: Visita técnica para reset e reconfiguração de todas as antenas/access points Unifi da pousada, devido à perda do servidor anterior. O serviço demandará um dia ou mais para conclusão	5	\N	2025-12-13 02:36:48.187181
1283	337	337	\N	service_deleted	Serviço #337 deletado	9	{"serviceId":337}	2025-12-13 02:36:50.073723
1284	331	359	\N	service_updated	Serviço #359 atualizado	9	{"serviceId":359}	2025-12-13 02:38:22.930461
1285	331	359	1213	converted_to_financial	Serviço convertido para faturamento: Verificar Pc na loja. ..	5	\N	2025-12-13 02:38:32.362976
1286	331	359	\N	service_deleted	Serviço #359 deletado	9	{"serviceId":359}	2025-12-13 02:38:34.292244
1287	353	348	\N	service_updated	Serviço #348 atualizado	9	{"serviceId":348}	2025-12-13 02:43:03.980649
1288	353	348	1216	converted_to_financial	Serviço convertido para faturamento: ROTINA DE BACKUP DOS BANCO DE DADOS.	5	\N	2025-12-13 02:43:12.66032
1289	353	348	\N	service_deleted	Serviço #348 deletado	9	{"serviceId":348}	2025-12-13 02:43:14.662359
1290	280	291	1217	converted_to_financial	Serviço convertido para faturamento: Cartuchos impressora e ver notebook. 	5	\N	2025-12-13 02:43:56.962556
1291	280	291	\N	service_deleted	Serviço #291 deletado	9	{"serviceId":291}	2025-12-13 02:43:59.001963
1292	202	\N	\N	call_deleted	Chamado #202 deletado	9	{"callId":202}	2025-12-13 02:44:39.924668
1293	110	\N	\N	call_deleted	Chamado #110 deletado	9	{"callId":110}	2025-12-13 02:44:54.288033
1294	114	\N	\N	call_deleted	Chamado #114 deletado	9	{"callId":114}	2025-12-13 02:44:59.743667
1295	112	\N	\N	call_deleted	Chamado #112 deletado	9	{"callId":112}	2025-12-13 02:45:23.527607
1296	239	\N	\N	call_deleted	Chamado #239 deletado	9	{"callId":239}	2025-12-13 02:45:40.304573
1297	242	\N	\N	call_deleted	Chamado #242 deletado	9	{"callId":242}	2025-12-13 02:46:03.149228
1298	245	531	\N	converted_to_service	Chamado convertido em serviço: Verificar HDTV em chinês deixar em português.	9	\N	2025-12-13 02:46:20.712177
1299	241	532	\N	converted_to_service	Chamado convertido em serviço: Pc Rose recepção ficando sem conexão. 	9	\N	2025-12-13 02:46:26.607191
1300	246	\N	\N	call_deleted	Chamado #246 deletado	9	{"callId":246}	2025-12-13 02:46:47.392227
1301	238	533	\N	converted_to_service	Chamado convertido em serviço: Visita técnica para ajustar o som e as antenas. 	9	\N	2025-12-13 02:47:03.533613
1302	251	534	\N	converted_to_service	Chamado convertido em serviço: Notebook e inpraora pra verificar. 	9	\N	2025-12-13 02:47:11.963063
1303	261	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-13 22:05:45.745509
1304	262	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-15 13:03:14.628959
1305	263	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-15 13:03:45.058544
1306	264	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-15 13:04:07.485279
1307	263	\N	\N	call_updated	Chamado #263 atualizado	9	{"callId":263}	2025-12-15 13:04:34.449382
1308	265	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-15 13:17:00.924594
1309	\N	535	\N	service_created	Serviço criado: Fonte ATX, Fonte IMP cupom, Roteador W6.	9	\N	2025-12-15 16:14:06.962089
1310	257	529	1209	transaction_deleted	Transação #1209 deletada - R$ 740.01	1	{"transactionId":1209,"amount":"740.01"}	2025-12-15 16:14:09.037609
1311	\N	535	\N	service_updated	Serviço #535 atualizado	9	{"serviceId":535}	2025-12-15 16:15:05.531316
1312	\N	535	\N	service_updated	Serviço #535 atualizado	9	{"serviceId":535}	2025-12-15 16:16:33.081205
1313	\N	535	1218	converted_to_financial	Serviço convertido para faturamento: Fonte ATX, Fonte IMP cupom, Roteador W6.	9	\N	2025-12-15 16:16:56.667607
1314	\N	535	\N	service_deleted	Serviço #535 deletado	9	{"serviceId":535}	2025-12-15 16:16:58.60907
1315	\N	536	\N	service_created	Serviço criado: Fonte ATX, Fonte IMP cupom, Roteador W6.	9	\N	2025-12-15 16:18:41.031827
1316	\N	535	1218	transaction_deleted	Transação #1218 deletada - R$ 740.01	1	{"transactionId":1218,"amount":"740.01"}	2025-12-15 16:18:43.027106
1317	\N	536	\N	service_updated	Serviço #536 atualizado	9	{"serviceId":536}	2025-12-15 16:23:39.063565
1318	\N	536	1219	converted_to_financial	Serviço convertido para faturamento: Fonte ATX, Fonte IMP cupom, Roteador W6.	9	\N	2025-12-15 16:24:37.678133
1319	\N	536	\N	service_deleted	Serviço #536 deletado	9	{"serviceId":536}	2025-12-15 16:24:39.637904
1320	\N	242	\N	service_updated	Serviço #242 atualizado	1	{"serviceId":242}	2025-12-15 16:35:35.016942
1321	337	337	1212	discount_applied	Desconto de R$ 50,00 aplicado à transação #1212	9	{"transactionId":1212,"discount":50,"originalAmount":845,"newAmount":795}	2025-12-15 16:36:42.160344
1322	\N	242	1220	converted_to_financial	Serviço convertido para faturamento: Passagem da fibra óptica pelos postes levando para bloco ADM e recebendo conexão para interligar sistema de energia solar. 	5	\N	2025-12-15 16:36:55.399093
1323	\N	242	\N	service_deleted	Serviço #242 deletado	1	{"serviceId":242}	2025-12-15 16:36:57.464883
1324	250	537	\N	converted_to_service	Chamado convertido em serviço: Pegar note na Jacaúna	9	\N	2025-12-15 16:43:10.21311
1325	243	\N	\N	call_deleted	Chamado #243 deletado	9	{"callId":243}	2025-12-15 16:43:29.308296
1326	238	533	\N	service_deleted	Serviço #533 deletado	9	{"serviceId":533}	2025-12-15 16:44:59.923709
1327	\N	\N	1221	payment_received	Pagamento recebido: Espetinhos com o amigo Jorge kk	1	\N	2025-12-15 21:50:17.758913
1328	266	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-15 23:22:36.479828
1329	\N	\N	1222	converted_to_financial	Serviço convertido para faturamento: Acesso remoto para ajustes na configuração da impressora na recepção	1	\N	2025-12-16 14:10:47.949621
1330	\N	538	\N	service_created	Serviço criado: Acesso remoto para ajustes na configuração da impressora na recepção	1	\N	2025-12-16 14:11:15.532584
1331	\N	\N	1222	transaction_deleted	Transação #1222 deletada - R$ 50.00	1	{"transactionId":1222,"amount":"50.00"}	2025-12-16 14:11:17.686381
1332	\N	538	\N	service_updated	Serviço #538 atualizado	1	{"serviceId":538}	2025-12-16 14:11:47.052144
1333	\N	538	1223	converted_to_financial	Serviço convertido para faturamento: Acesso remoto para ajustes na configuração da impressora na recepção	1	\N	2025-12-16 14:11:53.184196
1334	\N	538	\N	service_deleted	Serviço #538 deletado	1	{"serviceId":538}	2025-12-16 14:11:55.004353
1335	\N	539	\N	service_created	Serviço criado: Reparo Impressora Epson	9	\N	2025-12-16 15:31:22.960721
1336	\N	539	\N	service_updated	Serviço #539 atualizado	9	{"serviceId":539}	2025-12-16 15:35:01.625958
1337	\N	539	1224	converted_to_financial	Serviço convertido para faturamento: Reparo Impressora Epson	9	\N	2025-12-16 15:36:55.758046
1338	\N	539	\N	service_deleted	Serviço #539 deletado	9	{"serviceId":539}	2025-12-16 15:36:57.794045
1339	\N	539	1224	discount_applied	Desconto de R$ 50,00 aplicado à transação #1224	9	{"transactionId":1224,"discount":50,"originalAmount":285,"newAmount":235}	2025-12-16 15:37:08.61979
1340	266	540	\N	converted_to_service	Chamado convertido em serviço: Fonte ATX e adaptador wifiusb	9	\N	2025-12-16 15:39:12.415329
1341	265	\N	\N	call_deleted	Chamado #265 deletado	9	{"callId":265}	2025-12-16 15:39:27.281098
1342	266	540	\N	service_updated	Serviço #540 atualizado	9	{"serviceId":540}	2025-12-16 15:42:47.475337
1343	266	540	1225	converted_to_financial	Serviço convertido para faturamento: Fonte ATX e adaptador wifiusb	9	\N	2025-12-16 15:42:57.751637
1344	266	540	\N	service_deleted	Serviço #540 deletado	9	{"serviceId":540}	2025-12-16 15:43:00.075001
1345	251	534	\N	service_updated	Serviço #534 atualizado	9	{"serviceId":534}	2025-12-16 15:43:44.788009
1346	251	534	1226	converted_to_financial	Serviço convertido para faturamento: Notebook e inpraora pra verificar. 	9	\N	2025-12-16 15:43:51.941846
1347	251	534	\N	service_deleted	Serviço #534 deletado	9	{"serviceId":534}	2025-12-16 15:43:53.949075
1348	251	534	1226	payment_received	Pagamento recebido: Notebook e inpraora pra verificar. 	9	\N	2025-12-16 15:44:06.423216
1349	263	\N	\N	call_deleted	Chamado #263 deletado	9	{"callId":263}	2025-12-16 15:44:29.394307
1350	261	541	\N	converted_to_service	Chamado convertido em serviço: Resolução telefones.	9	\N	2025-12-16 15:44:49.024102
1351	262	542	\N	converted_to_service	Chamado convertido em serviço: Ajustes das câmeras e configuração de tela remota DVR HBtech diretoria. 	9	\N	2025-12-16 15:44:53.970421
1352	247	\N	\N	call_updated	Chamado #247 atualizado	9	{"callId":247}	2025-12-16 15:45:10.664683
1353	\N	538	1223	payment_received	Pagamento recebido: Acesso remoto para ajustes na configuração da impressora na recepção	1	\N	2025-12-16 17:04:13.418748
1354	\N	543	\N	service_created	Serviço criado: Fonte ATX, Fonte IMP cupom, Roteador W6.	9	\N	2025-12-17 16:33:17.407269
1355	\N	536	1219	transaction_deleted	Transação #1219 deletada - R$ 740.00	1	{"transactionId":1219,"amount":"740.00"}	2025-12-17 16:33:19.655649
1356	\N	543	\N	service_updated	Serviço #543 atualizado	9	{"serviceId":543}	2025-12-17 16:35:28.987524
1357	\N	543	1227	converted_to_financial	Serviço convertido para faturamento: Fonte ATX, Fonte IMP cupom, Roteador W6.	9	\N	2025-12-17 16:35:38.373635
1358	\N	543	\N	service_deleted	Serviço #543 deletado	9	{"serviceId":543}	2025-12-17 16:35:40.343426
1359	\N	544	\N	service_created	Serviço criado: Desktop Taffarel	9	\N	2025-12-17 16:36:03.629074
1360	\N	544	\N	service_updated	Serviço #544 atualizado	9	{"serviceId":544}	2025-12-17 16:37:25.965936
1361	\N	544	1228	converted_to_financial	Serviço convertido para faturamento: Desktop Taffarel	9	\N	2025-12-17 16:37:50.27161
1362	\N	544	\N	service_deleted	Serviço #544 deletado	9	{"serviceId":544}	2025-12-17 16:37:52.280955
1363	\N	545	\N	service_created	Serviço criado: Manutenção impressora Brother do caixa	1	\N	2025-12-17 20:29:16.044377
1364	240	527	\N	service_updated	Serviço #527 atualizado	1	{"serviceId":527}	2025-12-17 20:30:06.697563
1365	240	527	\N	service_updated	Serviço #527 atualizado	1	{"serviceId":527}	2025-12-17 20:32:40.674465
1366	240	527	\N	service_updated	Serviço #527 atualizado	1	{"serviceId":527}	2025-12-17 20:33:43.6358
1367	\N	521	\N	service_updated	Serviço #521 atualizado	1	{"serviceId":521}	2025-12-17 20:36:39.823031
1368	\N	521	\N	service_updated	Serviço #521 atualizado	1	{"serviceId":521}	2025-12-17 20:37:12.257997
1369	\N	521	1229	converted_to_financial	Serviço convertido para faturamento: Reparo no nobreak do servidor	1	\N	2025-12-17 20:37:31.069158
1370	\N	521	\N	service_deleted	Serviço #521 deletado	1	{"serviceId":521}	2025-12-17 20:37:32.900539
1371	240	527	\N	service_updated	Serviço #527 atualizado	1	{"serviceId":527}	2025-12-17 20:38:56.419802
1372	240	527	1230	converted_to_financial	Serviço convertido para faturamento: Computador balcão do canto está se desligando e muito lento, travando.	1	\N	2025-12-17 20:39:16.187924
1373	240	527	\N	service_deleted	Serviço #527 deletado	1	{"serviceId":527}	2025-12-17 20:39:18.10991
1374	260	528	1231	converted_to_financial	Serviço convertido para faturamento: CPU gamer liga mas não dá vídeo	1	\N	2025-12-17 20:41:56.13299
1375	260	528	\N	service_deleted	Serviço #528 deletado	1	{"serviceId":528}	2025-12-17 20:41:58.026402
1376	\N	\N	\N	client_created	Cliente Thiago Couto criado	9	{"clientId":173,"clientName":"Thiago Couto"}	2025-12-18 20:18:02.34615
1377	267	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-18 20:18:30.239077
1378	\N	\N	1232	payment_received	Pagamento recebido: Kalione compra dos Lenovos 	1	\N	2025-12-19 10:15:23.025546
1379	\N	\N	\N	client_created	Cliente Sertão Frios criado	1	{"clientId":174,"clientName":"Sertão Frios"}	2025-12-19 13:02:15.794319
1380	\N	546	\N	service_created	Serviço criado: Suporte remoto para instalação de impressora na rede e nos computadores	1	\N	2025-12-19 13:02:45.960071
1381	\N	546	\N	service_updated	Serviço #546 atualizado	1	{"serviceId":546}	2025-12-19 13:03:10.311106
1382	\N	546	1233	converted_to_financial	Serviço convertido para faturamento: Suporte remoto para instalação de impressora na rede e nos computadores	1	\N	2025-12-19 13:09:24.641162
1383	\N	546	\N	service_deleted	Serviço #546 deletado	1	{"serviceId":546}	2025-12-19 13:09:26.511943
1384	\N	546	1233	payment_received	Pagamento recebido: Suporte remoto para instalação de impressora na rede e nos computadores	1	\N	2025-12-19 13:09:50.06736
1385	\N	\N	\N	client_created	Cliente Merry Cherry criado	9	{"clientId":175,"clientName":"Merry Cherry"}	2025-12-20 13:53:33.592478
1386	268	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-20 13:53:44.619592
1387	269	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-20 13:54:03.093933
1388	\N	\N	1234	payment_received	Pagamento recebido: Parcela 5 - Parcelamento avulso materiais e serviços 	1	\N	2025-12-20 16:17:50.382721
1389	\N	519	1196	payment_received	Pagamento recebido: Ajustes nos sistemas de câmeras de Upanema e Mossoró	1	\N	2025-12-20 16:17:59.634327
1390	241	288	514	payment_received	Pagamento recebido: Ajustes na estrutura de rede e instalação de switch 8 portas giga	1	\N	2025-12-20 16:18:07.114276
1391	\N	\N	1235	payment_received	Pagamento recebido: Material em Tibau	1	\N	2025-12-20 16:35:55.764611
1392	\N	\N	1236	payment_received	Pagamento recebido: 11/12 penúltima parcela Forex	1	\N	2025-12-20 16:36:30.216139
1393	\N	\N	1237	payment_received	Pagamento recebido: 6/12 parcela inicial sistema	1	\N	2025-12-20 16:37:23.481808
1394	\N	\N	1238	payment_received	Pagamento recebido: Replit mensalidade	1	\N	2025-12-20 16:38:33.339343
1395	268	547	\N	converted_to_service	Chamado convertido em serviço: Manutenção servidor loja santo Antônio	9	\N	2025-12-22 11:30:23.161948
1396	270	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-22 11:31:14.896525
1397	271	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-22 11:32:06.070032
1398	\N	548	\N	service_created	Serviço criado: Conclusão serviço Tibau	9	\N	2025-12-22 13:35:35.167002
1399	\N	548	\N	service_updated	Serviço #548 atualizado	9	{"serviceId":548}	2025-12-22 13:42:45.830094
1400	\N	548	1239	converted_to_financial	Serviço convertido para faturamento: Conclusão serviço Tibau	9	\N	2025-12-22 13:42:55.620952
1401	\N	548	\N	service_deleted	Serviço #548 deletado	9	{"serviceId":548}	2025-12-22 13:42:57.509352
1402	\N	163	\N	service_updated	Serviço #163 atualizado	9	{"serviceId":163}	2025-12-22 13:56:44.277317
1403	\N	163	1240	converted_to_financial	Serviço convertido para faturamento: Orçamento serviço casa da praia. 	5	\N	2025-12-22 13:56:54.263005
1404	\N	163	\N	service_deleted	Serviço #163 deletado	9	{"serviceId":163}	2025-12-22 13:56:56.154654
1405	\N	549	\N	service_created	Serviço criado: Orçamento serviço casa da praia.	1	\N	2025-12-22 14:01:50.201579
1406	\N	163	1240	transaction_deleted	Transação #1240 deletada - R$ 7035.00	1	{"transactionId":1240,"amount":"7035.00"}	2025-12-22 14:01:52.238383
1407	\N	549	\N	service_updated	Serviço #549 atualizado	1	{"serviceId":549}	2025-12-22 14:02:32.03097
1408	\N	549	\N	service_updated	Serviço #549 atualizado	1	{"serviceId":549}	2025-12-22 14:02:33.151565
1409	\N	549	1241	converted_to_financial	Serviço convertido para faturamento: Orçamento serviço casa da praia.	1	\N	2025-12-22 14:03:34.150317
1410	\N	549	\N	service_deleted	Serviço #549 deletado	1	{"serviceId":549}	2025-12-22 14:03:36.039999
1411	272	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-22 14:45:25.536151
1412	273	\N	\N	call_created	Chamado criado: 	1	\N	2025-12-22 19:48:35.650423
1413	274	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-23 11:56:12.103802
1414	275	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-26 13:25:41.71933
1415	275	\N	\N	call_updated	Chamado #275 atualizado	9	{"callId":275}	2025-12-26 13:26:07.557321
1416	275	\N	\N	call_updated	Chamado #275 atualizado	9	{"callId":275}	2025-12-26 13:43:47.854355
1417	275	\N	\N	call_updated	Chamado #275 atualizado	9	{"callId":275}	2025-12-26 13:48:55.494253
1418	275	\N	\N	call_updated	Chamado #275 atualizado	9	{"callId":275}	2025-12-26 13:49:11.08139
1419	275	\N	\N	call_updated	Chamado #275 atualizado	9	{"callId":275}	2025-12-26 13:49:12.898202
1420	274	550	\N	converted_to_service	Chamado convertido em serviço: Problemas rede cabeada. Levar um Switch. 	9	\N	2025-12-26 19:17:00.819871
1421	\N	549	1241	payment_received	Pagamento recebido: Orçamento serviço casa da praia.	9	\N	2025-12-26 19:17:34.257718
1422	\N	548	1239	payment_received	Pagamento recebido: Conclusão serviço Tibau	9	\N	2025-12-26 19:17:41.858315
1423	\N	544	1228	payment_received	Pagamento recebido: Desktop Taffarel	9	\N	2025-12-26 19:18:32.550718
1424	253	\N	\N	call_updated	Chamado #253 atualizado	9	{"callId":253}	2025-12-26 19:22:50.163363
1425	269	551	\N	converted_to_service	Chamado convertido em serviço: Note de Kew não liga. 	9	\N	2025-12-26 19:23:02.620997
1426	254	\N	\N	call_deleted	Chamado #254 deletado	9	{"callId":254}	2025-12-26 19:23:14.270381
1427	244	\N	\N	call_deleted	Chamado #244 deletado	9	{"callId":244}	2025-12-26 19:23:20.658369
1428	204	\N	\N	call_updated	Chamado #204 atualizado	9	{"callId":204}	2025-12-26 19:23:41.080127
1429	\N	552	\N	service_created	Serviço criado: Reparo placa Lenovo.	9	\N	2025-12-26 19:24:42.281835
1430	\N	552	\N	service_updated	Serviço #552 atualizado	9	{"serviceId":552}	2025-12-26 19:24:54.379062
1431	\N	553	\N	service_created	Serviço criado: Rômulo 2 desktop.	9	\N	2025-12-26 19:25:28.414042
1432	275	\N	\N	call_updated	Chamado #275 atualizado	9	{"callId":275}	2025-12-26 19:26:06.94004
1433	\N	\N	\N	client_created	Cliente Pollyana Pinto criado	9	{"clientId":176,"clientName":"Pollyana Pinto"}	2025-12-26 19:26:33.539148
1434	276	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-26 19:26:52.012331
1435	275	\N	\N	call_updated	Chamado #275 atualizado	9	{"callId":275}	2025-12-26 19:27:30.68864
1436	277	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-26 19:27:58.678197
1437	247	\N	\N	call_updated	Chamado #247 atualizado	9	{"callId":247}	2025-12-26 19:28:19.758142
1438	260	528	1231	payment_received	Pagamento recebido: CPU gamer liga mas não dá vídeo	1	\N	2025-12-28 13:16:07.536215
1439	\N	554	\N	service_created	Serviço criado: Queda link	9	\N	2025-12-29 18:03:35.863836
1440	\N	554	\N	service_updated	Serviço #554 atualizado	9	{"serviceId":554}	2025-12-29 18:04:56.052648
1441	\N	554	1242	converted_to_financial	Serviço convertido para faturamento: Queda link	9	\N	2025-12-29 18:05:03.957401
1442	\N	554	\N	service_deleted	Serviço #554 deletado	9	{"serviceId":554}	2025-12-29 18:05:05.921334
1443	\N	\N	\N	client_created	Cliente Rômulo Paiva ADV criado	9	{"clientId":177,"clientName":"Rômulo Paiva ADV"}	2025-12-29 18:05:56.065418
1444	278	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-29 18:05:58.315675
1445	\N	\N	1243	payment_received	Pagamento recebido: Estabilizador Carliane Cia da fórmula	1	\N	2025-12-30 10:44:38.221507
1446	279	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-30 14:32:25.968777
1447	280	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-30 14:44:05.91617
1448	\N	\N	\N	client_created	Cliente Luana Ramos criado	9	{"clientId":178,"clientName":"Luana Ramos"}	2025-12-30 20:06:09.248508
1449	281	\N	\N	call_created	Chamado criado: 	9	\N	2025-12-30 20:06:16.793751
1450	276	555	\N	converted_to_service	Chamado convertido em serviço: Verificar notebook 	9	\N	2026-01-03 15:11:54.912484
1451	276	555	\N	service_updated	Serviço #555 atualizado	9	{"serviceId":555}	2026-01-03 15:17:17.103815
1452	276	555	\N	service_updated	Serviço #555 atualizado	9	{"serviceId":555}	2026-01-03 15:20:36.245262
1453	276	555	1244	converted_to_financial	Serviço convertido para faturamento: Verificar notebook 	9	\N	2026-01-03 15:20:54.189467
1454	276	555	\N	service_deleted	Serviço #555 deletado	9	{"serviceId":555}	2026-01-03 15:20:56.273408
1455	281	556	\N	converted_to_service	Chamado convertido em serviço: Aluguel de máquinas Tibau. 	9	\N	2026-01-04 00:10:55.971557
1456	279	557	\N	converted_to_service	Chamado convertido em serviço: Verificar notebook.  	9	\N	2026-01-04 00:13:19.410469
1457	253	558	\N	converted_to_service	Chamado convertido em serviço: Note Kew tá com Claudinho pra adapta botão. 	9	\N	2026-01-04 00:13:33.891814
1458	273	559	\N	converted_to_service	Chamado convertido em serviço: Manutenção nos três computadores do escritório	1	\N	2026-01-04 00:13:40.975979
1459	271	\N	\N	call_deleted	Chamado #271 deletado	9	{"callId":271}	2026-01-04 00:13:58.683703
1460	267	\N	\N	call_updated	Chamado #267 atualizado	9	{"callId":267}	2026-01-04 00:14:42.706833
1461	264	560	\N	converted_to_service	Chamado convertido em serviço: Problema wpp	9	\N	2026-01-04 00:14:54.62868
1462	\N	561	\N	service_created	Serviço criado: Dr Otávio Casa da Praia.	9	\N	2026-01-04 00:17:06.2187
1463	\N	561	\N	service_updated	Serviço #561 atualizado	9	{"serviceId":561}	2026-01-04 00:24:31.724855
1464	\N	561	\N	service_updated	Serviço #561 atualizado	9	{"serviceId":561}	2026-01-04 00:24:33.617242
1465	\N	561	1245	converted_to_financial	Serviço convertido para faturamento: Dr Otávio Casa da Praia.	9	\N	2026-01-04 00:24:49.169833
1466	\N	561	\N	service_deleted	Serviço #561 deletado	9	{"serviceId":561}	2026-01-04 00:24:51.07999
1467	281	556	\N	service_updated	Serviço #556 atualizado	9	{"serviceId":556}	2026-01-04 00:40:33.605624
1468	281	556	1246	converted_to_financial	Serviço convertido para faturamento: Aluguel de máquinas Tibau. 	9	\N	2026-01-04 00:41:01.167921
1469	281	556	\N	service_deleted	Serviço #556 deletado	9	{"serviceId":556}	2026-01-04 00:41:03.059953
1470	\N	562	\N	service_created	Serviço criado: Dr Otávio Casa da Praia.	9	\N	2026-01-04 00:50:10.00032
1471	\N	561	1245	transaction_deleted	Transação #1245 deletada - R$ 550.00	1	{"transactionId":1245,"amount":"550.00"}	2026-01-04 00:50:12.007832
1472	\N	562	\N	service_updated	Serviço #562 atualizado	9	{"serviceId":562}	2026-01-04 00:50:52.214647
1473	\N	562	1247	converted_to_financial	Serviço convertido para faturamento: Dr Otávio Casa da Praia.	9	\N	2026-01-04 00:50:58.944213
1474	\N	562	\N	service_deleted	Serviço #562 deletado	9	{"serviceId":562}	2026-01-04 00:51:00.843242
1475	273	559	\N	service_updated	Serviço #559 atualizado	1	{"serviceId":559}	2026-01-05 11:31:10.216907
1476	282	\N	\N	call_created	Chamado criado: 	9	\N	2026-01-05 12:08:48.609951
1477	\N	563	\N	service_created	Serviço criado: Fonte e filtro de linha	9	\N	2026-01-05 12:09:23.316554
1478	280	564	\N	converted_to_service	Chamado convertido em serviço: Deixar HDTV	9	\N	2026-01-05 12:09:40.687299
1479	283	\N	\N	call_created	Chamado criado: 	9	\N	2026-01-05 12:10:14.311791
1480	284	\N	\N	call_created	Chamado criado: 	9	\N	2026-01-05 12:10:49.248127
1481	270	\N	\N	call_deleted	Chamado #270 deletado	9	{"callId":270}	2026-01-05 12:11:23.106549
1482	\N	565	\N	service_created	Serviço criado: Manutenção dois desktop Rômulo.	9	\N	2026-01-05 12:12:25.176849
1483	283	\N	\N	call_updated	Chamado #283 atualizado	9	{"callId":283}	2026-01-05 13:03:14.661128
1484	258	526	1201	payment_received	Pagamento recebido: PC Janaíne parou de funcionar após queda de energia	1	\N	2026-01-05 17:33:38.215115
1485	\N	\N	509	payment_received	Pagamento recebido: Suporte remoto para ajustes na configuração do acesso ao sistema de câmeras e gravações.	1	\N	2026-01-05 17:33:46.173991
1486	265	287	453	payment_received	Pagamento recebido: CPU Jacinta sem conexão de internet	1	\N	2026-01-05 17:33:59.560539
1487	273	559	1253	converted_to_financial	Serviço convertido para faturamento: Manutenção nos três computadores do escritório	1	\N	2026-01-05 18:06:39.353329
1488	273	559	\N	service_deleted	Serviço #559 deletado	1	{"serviceId":559}	2026-01-05 18:06:41.255167
1489	273	\N	1254	payment_received	Pagamento recebido: Parcela 1 - Manutenção nos três computadores do escritório	1	\N	2026-01-05 18:19:33.75189
1490	273	\N	1254	payment_received	Pagamento recebido: Parcela 1 - Manutenção nos três computadores do escritório	1	\N	2026-01-05 18:19:35.616515
1491	285	\N	\N	call_created	Chamado criado: 	7	\N	2026-01-06 21:47:43.327592
1492	286	\N	\N	call_created	Chamado criado: 	9	\N	2026-01-07 12:28:24.929361
1493	287	\N	\N	call_created	Chamado criado: 	9	\N	2026-01-08 00:06:14.298258
1494	288	\N	\N	call_created	Chamado criado: 	9	\N	2026-01-08 00:06:41.363579
1495	275	\N	\N	call_deleted	Chamado #275 deletado	9	{"callId":275}	2026-01-08 00:06:59.063662
1496	\N	566	\N	service_created	Serviço criado: Som	9	\N	2026-01-08 15:46:10.142982
1497	289	\N	\N	call_created	Chamado criado: 	9	\N	2026-01-08 15:47:58.383028
1498	289	\N	\N	call_deleted	Chamado #289 deletado	9	{"callId":289}	2026-01-08 15:48:13.388108
1499	\N	\N	\N	client_created	Cliente Renata Abl 3 criado	9	{"clientId":179,"clientName":"Renata Abl 3"}	2026-01-09 11:08:17.208975
1500	290	\N	\N	call_created	Chamado criado: 	9	\N	2026-01-09 11:08:28.200769
1501	290	\N	\N	call_updated	Chamado #290 atualizado	9	{"callId":290}	2026-01-09 11:09:12.736155
1502	277	\N	\N	call_updated	Chamado #277 atualizado	9	{"callId":277}	2026-01-09 12:58:42.174225
1503	291	\N	\N	call_created	Chamado criado: 	1	\N	2026-01-09 13:13:46.85485
1504	204	\N	\N	call_deleted	Chamado #204 deletado	9	{"callId":204}	2026-01-09 13:31:12.579532
1505	286	567	\N	converted_to_service	Chamado convertido em serviço: Pegar note pra analisar. 	9	\N	2026-01-09 13:31:23.227343
1506	286	567	\N	service_updated	Serviço #567 atualizado	9	{"serviceId":567}	2026-01-09 13:42:01.265157
1507	291	568	\N	converted_to_service	Chamado convertido em serviço: Impressora Epson imprimindo em branco	1	\N	2026-01-12 12:45:45.073102
1508	291	568	\N	service_updated	Serviço #568 atualizado	1	{"serviceId":568}	2026-01-12 12:46:39.870259
1509	\N	569	\N	service_created	Serviço criado: Instalação Taffarel	9	\N	2026-01-12 19:23:26.64084
1510	\N	569	\N	service_updated	Serviço #569 atualizado	9	{"serviceId":569}	2026-01-12 19:28:02.351156
1511	291	568	1255	converted_to_financial	Serviço convertido para faturamento: Impressora Epson imprimindo em branco	1	\N	2026-01-13 02:32:57.455595
1512	291	568	\N	service_deleted	Serviço #568 deletado	1	{"serviceId":568}	2026-01-13 02:32:59.460468
1513	291	568	1255	payment_received	Pagamento recebido: Impressora Epson imprimindo em branco	1	\N	2026-01-13 02:33:30.327799
1514	\N	\N	1256	payment_received	Pagamento recebido: Kalione	1	\N	2026-01-13 02:34:46.46506
1515	\N	\N	1257	converted_to_financial	Serviço convertido para faturamento: Kalione	1	\N	2026-01-13 02:35:30.56492
1516	\N	\N	1257	payment_received	Pagamento recebido: Kalione	1	\N	2026-01-13 02:35:39.490464
1517	\N	\N	1258	converted_to_financial	Serviço convertido para faturamento: Chopp e pizza crocante em Tibau	1	\N	2026-01-13 02:41:02.378519
1518	\N	\N	1258	payment_received	Pagamento recebido: Chopp e pizza crocante em Tibau	1	\N	2026-01-13 02:41:40.288077
1519	\N	\N	1259	converted_to_financial	Serviço convertido para faturamento: Material Abel gordinho construfat	1	\N	2026-01-13 02:43:14.316142
1520	\N	\N	1259	payment_received	Pagamento recebido: Material Abel gordinho construfat	1	\N	2026-01-13 02:43:26.376595
1521	\N	\N	\N	client_created	Cliente Jacinta Rocha Salão criado	1	{"clientId":180,"clientName":"Jacinta Rocha Salão"}	2026-01-13 11:35:38.630321
1522	292	\N	\N	call_created	Chamado criado: 	1	\N	2026-01-13 11:36:08.697879
1523	\N	570	\N	service_created	Serviço criado: Teates	9	\N	2026-01-13 12:55:48.959653
1524	\N	570	\N	service_updated	Serviço #570 atualizado	9	{"serviceId":570}	2026-01-13 12:58:49.814556
1525	\N	570	\N	service_updated	Serviço #570 atualizado	9	{"serviceId":570}	2026-01-13 13:00:21.744561
1526	\N	570	\N	service_updated	Serviço #570 atualizado	9	{"serviceId":570}	2026-01-13 13:00:23.497688
1527	\N	570	\N	service_deleted	Serviço #570 deletado	9	{"serviceId":570}	2026-01-13 13:10:51.747014
1528	\N	569	\N	service_deleted	Serviço #569 deletado	9	{"serviceId":569}	2026-01-13 13:10:59.354356
1529	286	567	\N	service_updated	Serviço #567 atualizado	9	{"serviceId":567}	2026-01-13 13:11:09.586989
1530	286	567	1260	converted_to_financial	Serviço convertido para faturamento: Pegar note pra analisar. 	9	\N	2026-01-13 13:11:29.856103
1531	286	567	\N	service_deleted	Serviço #567 deletado	9	{"serviceId":567}	2026-01-13 13:11:31.854553
1532	\N	571	\N	service_created	Serviço criado: Pegar note pra analisar.	9	\N	2026-01-13 13:13:29.014934
1533	286	567	1260	transaction_deleted	Transação #1260 deletada - R$ 385.00	1	{"transactionId":1260,"amount":"385.00"}	2026-01-13 13:13:31.004697
1534	\N	571	\N	service_updated	Serviço #571 atualizado	9	{"serviceId":571}	2026-01-13 13:15:37.640879
1535	\N	571	\N	service_updated	Serviço #571 atualizado	9	{"serviceId":571}	2026-01-13 13:17:25.559323
1536	\N	571	\N	service_updated	Serviço #571 atualizado	9	{"serviceId":571}	2026-01-13 13:29:33.225378
1537	\N	571	\N	service_updated	Serviço #571 atualizado	9	{"serviceId":571}	2026-01-13 13:29:34.352901
1538	\N	571	\N	service_updated	Serviço #571 atualizado	9	{"serviceId":571}	2026-01-13 13:31:30.482218
1539	\N	571	1261	converted_to_financial	Serviço convertido para faturamento: Pegar note pra analisar.	9	\N	2026-01-13 13:32:31.619087
1540	\N	571	\N	service_deleted	Serviço #571 deletado	9	{"serviceId":571}	2026-01-13 13:32:33.823732
1541	\N	572	\N	service_created	Serviço criado: Config Roteador	9	\N	2026-01-13 14:48:24.38585
1542	\N	572	\N	service_updated	Serviço #572 atualizado	9	{"serviceId":572}	2026-01-13 14:49:11.111163
1543	\N	572	1262	converted_to_financial	Serviço convertido para faturamento: Config Roteador	9	\N	2026-01-13 14:49:18.897652
1544	\N	572	\N	service_deleted	Serviço #572 deletado	9	{"serviceId":572}	2026-01-13 14:49:20.876117
1545	\N	572	1262	discount_applied	Desconto de R$ 20,00 aplicado à transação #1262	9	{"transactionId":1262,"discount":20,"originalAmount":100,"newAmount":80}	2026-01-13 14:49:41.299138
1546	290	573	\N	converted_to_service	Chamado convertido em serviço: Pegar note para fazer baixa. \nRua Rolô Eufrásio, 29, abolição 3.\nRua por trás da Igreja São Francisco	9	\N	2026-01-13 18:38:57.968968
1547	290	573	\N	service_updated	Serviço #573 atualizado	9	{"serviceId":573}	2026-01-13 18:40:20.546806
1548	277	574	\N	converted_to_service	Chamado convertido em serviço: Pegar nobreak	9	\N	2026-01-13 18:56:38.531241
1549	287	\N	\N	call_deleted	Chamado #287 deletado	9	{"callId":287}	2026-01-13 18:56:52.50323
1550	293	\N	\N	call_created	Chamado criado: 	9	\N	2026-01-13 23:47:34.171633
1551	285	575	\N	converted_to_service	Chamado convertido em serviço: Verificar  problema no computador Gustavo Rosada, que não está ligando.	7	\N	2026-01-14 11:17:49.926927
1552	\N	576	\N	service_created	Serviço criado: Sama Nobreak	9	\N	2026-01-14 11:19:22.066929
1553	\N	576	\N	service_updated	Serviço #576 atualizado	9	{"serviceId":576}	2026-01-14 11:21:05.169714
1554	\N	576	1263	converted_to_financial	Serviço convertido para faturamento: Sama Nobreak	9	\N	2026-01-14 11:21:19.892115
1555	\N	576	\N	service_deleted	Serviço #576 deletado	9	{"serviceId":576}	2026-01-14 11:21:21.862427
1556	245	531	\N	service_deleted	Serviço #531 deletado	9	{"serviceId":531}	2026-01-14 11:24:19.165746
1557	313	344	\N	service_deleted	Serviço #344 deletado	9	{"serviceId":344}	2026-01-14 11:25:11.128761
1558	\N	577	\N	service_created	Serviço criado: Odete rotina de backups	9	\N	2026-01-14 11:34:29.530129
1559	\N	577	\N	service_updated	Serviço #577 atualizado	9	{"serviceId":577}	2026-01-14 11:34:59.807347
1560	\N	577	1264	converted_to_financial	Serviço convertido para faturamento: Odete rotina de backups	9	\N	2026-01-14 11:35:08.190236
1561	\N	577	\N	service_deleted	Serviço #577 deletado	9	{"serviceId":577}	2026-01-14 11:35:11.961281
1562	\N	578	\N	service_created	Serviço criado: Análise Link problema wpp	9	\N	2026-01-14 11:39:07.99133
1563	\N	578	\N	service_updated	Serviço #578 atualizado	9	{"serviceId":578}	2026-01-14 11:41:58.528886
1564	\N	578	1265	converted_to_financial	Serviço convertido para faturamento: Análise Link problema wpp	9	\N	2026-01-14 11:42:12.513433
1565	\N	578	\N	service_deleted	Serviço #578 deletado	9	{"serviceId":578}	2026-01-14 11:42:14.795632
1566	\N	579	\N	service_created	Serviço criado: Odete queda da brisa. 	9	\N	2026-01-14 11:44:37.094401
1567	\N	579	\N	service_updated	Serviço #579 atualizado	9	{"serviceId":579}	2026-01-14 11:45:40.029213
1568	\N	579	\N	service_updated	Serviço #579 atualizado	9	{"serviceId":579}	2026-01-14 11:45:42.182337
1569	\N	579	1266	converted_to_financial	Serviço convertido para faturamento: Odete queda da brisa. 	9	\N	2026-01-14 11:45:48.666943
1570	\N	579	\N	service_deleted	Serviço #579 deletado	9	{"serviceId":579}	2026-01-14 11:45:50.559718
1571	294	\N	\N	call_created	Chamado criado: 	9	\N	2026-01-14 13:04:37.666228
1572	\N	580	\N	service_created	Serviço criado: testestestes	1	\N	2026-01-14 13:38:26.383895
1573	\N	580	1267	converted_to_financial	Serviço convertido para faturamento: testestestes	1	\N	2026-01-14 13:39:04.587677
1574	\N	580	\N	service_deleted	Serviço #580 deletado	1	{"serviceId":580}	2026-01-14 13:39:06.613925
1575	\N	\N	\N	client_created	Cliente Isabel Linhares - Clínica Mariana Lopes criado	9	{"clientId":181,"clientName":"Isabel Linhares - Clínica Mariana Lopes"}	2026-01-14 14:23:22.548921
1576	295	\N	\N	call_created	Chamado criado: 	9	\N	2026-01-14 14:23:39.608712
1577	253	558	\N	service_updated	Serviço #558 atualizado	9	{"serviceId":558}	2026-01-14 15:45:25.424485
1578	253	558	1268	converted_to_financial	Serviço convertido para faturamento: Note Kew tá com Claudinho pra adapta botão. 	9	\N	2026-01-14 15:49:13.604201
1579	253	558	\N	service_deleted	Serviço #558 deletado	9	{"serviceId":558}	2026-01-14 15:49:15.628683
1580	\N	581	\N	service_created	Serviço criado: IMP recepção Bestlaser	9	\N	2026-01-14 15:49:46.518847
1581	\N	581	\N	service_updated	Serviço #581 atualizado	9	{"serviceId":581}	2026-01-14 15:51:02.790612
1582	\N	581	1269	converted_to_financial	Serviço convertido para faturamento: IMP recepção Bestlaser	9	\N	2026-01-14 15:51:16.249821
1583	\N	581	\N	service_deleted	Serviço #581 deletado	9	{"serviceId":581}	2026-01-14 15:51:18.31821
1584	\N	582	\N	service_created	Serviço criado: IMP recepção Bestlaser	9	\N	2026-01-14 15:52:15.280478
1585	\N	582	\N	service_updated	Serviço #582 atualizado	9	{"serviceId":582}	2026-01-14 15:53:23.771275
1586	296	\N	\N	call_created	Chamado criado: 	1	\N	2026-01-14 22:02:04.419575
1587	297	\N	\N	call_created	Chamado criado: 	9	\N	2026-01-15 12:55:17.897524
1588	298	\N	\N	call_created	Chamado criado: 	9	\N	2026-01-15 12:57:18.037589
1589	299	\N	\N	call_created	Chamado criado: 	9	\N	2026-01-15 12:57:40.536487
1590	\N	583	\N	service_created	Serviço criado: João da Escóssia - resolução problema da rede. 	9	\N	2026-01-15 13:05:40.680217
1591	\N	584	\N	service_created	Serviço criado: Taffarel - Configuração de máquina na rede	9	\N	2026-01-15 15:32:27.391264
1592	\N	584	\N	service_updated	Serviço #584 atualizado	9	{"serviceId":584}	2026-01-15 15:34:19.756195
1593	250	537	\N	service_updated	Serviço #537 atualizado	9	{"serviceId":537}	2026-01-15 15:51:16.160159
1594	\N	\N	1270	converted_to_financial	Serviço convertido para faturamento: Testes	1	\N	2026-01-15 17:05:21.572418
1595	\N	\N	1270	transaction_deleted	Transação #1270 deletada - R$ 200.00	1	{"transactionId":1270,"amount":"200.00"}	2026-01-15 17:06:23.314136
1596	\N	580	1267	transaction_deleted	Transação #1267 deletada - R$ 100.00	1	{"transactionId":1267,"amount":"100.00"}	2026-01-15 17:07:05.160596
1597	\N	\N	1271	converted_to_financial	Serviço convertido para faturamento: Teste	1	\N	2026-01-15 17:44:28.081583
1598	\N	\N	1271	transaction_deleted	Transação #1271 deletada - R$ 200.00	1	{"transactionId":1271,"amount":"200.00"}	2026-01-15 17:44:56.993665
1599	\N	\N	1272	converted_to_financial	Serviço convertido para faturamento: Testes	1	\N	2026-01-15 18:08:33.635896
1600	\N	\N	1273	converted_to_financial	Serviço convertido para faturamento: Testes	1	\N	2026-01-15 18:09:01.5047
1601	\N	530	\N	service_updated	Serviço #530 atualizado	9	{"serviceId":530}	2026-01-15 19:37:18.914407
1602	\N	530	\N	service_updated	Serviço #530 atualizado	9	{"serviceId":530}	2026-01-15 19:37:20.588989
1603	\N	\N	1274	converted_to_financial	Serviço convertido para faturamento: SSD 256gb gordinho Charles	1	\N	2026-01-16 12:30:49.257584
1604	\N	\N	1274	payment_received	Pagamento recebido: SSD 256gb gordinho Charles	1	\N	2026-01-16 12:30:56.994143
1605	300	\N	\N	call_created	Chamado criado: 	9	\N	2026-01-16 13:15:01.110293
1606	\N	530	\N	service_updated	Serviço #530 atualizado	9	{"serviceId":530}	2026-01-16 14:16:51.069328
1607	\N	530	\N	service_updated	Serviço #530 atualizado	9	{"serviceId":530}	2026-01-16 14:17:05.583752
1608	\N	585	\N	service_created	Serviço criado: Substituição de Armazenamento (SSD)	7	\N	2026-01-16 14:17:06.007116
1609	\N	530	\N	service_updated	Serviço #530 atualizado	9	{"serviceId":530}	2026-01-16 14:19:17.761103
1610	\N	530	\N	service_updated	Serviço #530 atualizado	9	{"serviceId":530}	2026-01-16 14:26:22.865425
1611	\N	585	\N	service_updated	Serviço #585 atualizado	7	{"serviceId":585}	2026-01-16 14:27:02.580627
1612	\N	530	\N	service_updated	Serviço #530 atualizado	9	{"serviceId":530}	2026-01-16 14:28:19.766604
1613	\N	585	\N	service_updated	Serviço #585 atualizado	7	{"serviceId":585}	2026-01-16 14:29:01.289733
1614	\N	585	\N	service_updated	Serviço #585 atualizado	7	{"serviceId":585}	2026-01-16 14:31:18.455528
1615	\N	585	\N	service_updated	Serviço #585 atualizado	7	{"serviceId":585}	2026-01-16 14:32:11.312487
1616	\N	585	\N	service_updated	Serviço #585 atualizado	7	{"serviceId":585}	2026-01-16 14:33:25.153748
1617	\N	585	\N	service_updated	Serviço #585 atualizado	7	{"serviceId":585}	2026-01-16 14:35:15.490493
1618	301	\N	\N	call_created	Chamado criado: 	9	\N	2026-01-16 14:39:28.255865
1619	301	\N	\N	call_updated	Chamado #301 atualizado	9	{"callId":301}	2026-01-16 14:39:43.763161
1620	301	\N	\N	call_updated	Chamado #301 atualizado	9	{"callId":301}	2026-01-16 14:39:45.402694
1621	\N	\N	1275	converted_to_financial	Serviço convertido para faturamento: Última parcela Forex	1	\N	2026-01-19 11:20:18.918779
1622	\N	\N	1275	payment_received	Pagamento recebido: Última parcela Forex	1	\N	2026-01-19 11:20:25.924795
1623	302	\N	\N	call_created	Chamado criado: 	7	\N	2026-01-19 11:46:52.572212
1624	\N	\N	\N	client_created	Cliente Kaio Victor criado	9	{"clientId":182,"clientName":"Kaio Victor"}	2026-01-19 11:53:49.741338
1625	303	\N	\N	call_created	Chamado criado: 	9	\N	2026-01-19 11:53:51.780631
1626	304	\N	\N	call_created	Chamado criado: 	9	\N	2026-01-19 11:54:20.561548
1627	305	\N	\N	call_created	Chamado criado: 	9	\N	2026-01-19 11:55:39.910821
1628	277	574	\N	service_updated	Serviço #574 atualizado	9	{"serviceId":574}	2026-01-19 12:07:27.694309
1629	277	574	1276	converted_to_financial	Serviço convertido para faturamento: Pegar nobreak	9	\N	2026-01-19 12:07:34.42063
1630	277	574	\N	service_deleted	Serviço #574 deletado	9	{"serviceId":574}	2026-01-19 12:07:36.2716
1631	306	\N	\N	call_created	Chamado criado: 	9	\N	2026-01-19 13:14:47.339141
1632	299	586	\N	converted_to_service	Chamado convertido em serviço: Desktop pra analisar. 	9	\N	2026-01-19 13:14:59.724421
1633	298	587	\N	converted_to_service	Chamado convertido em serviço: Cameras da casa 	9	\N	2026-01-19 13:15:10.343116
1634	\N	\N	1277	converted_to_financial	Serviço convertido para faturamento: Kalione final do lote Lenovo e nobreak	1	\N	2026-01-19 16:02:12.041412
1635	\N	\N	1277	payment_received	Pagamento recebido: Kalione final do lote Lenovo e nobreak	1	\N	2026-01-19 16:02:18.78036
1636	\N	588	\N	service_created	Serviço criado: Abel IMP diretoria	9	\N	2026-01-20 15:39:08.927025
\.


--
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.inventory_movements (id, product_id, type, quantity, reference, notes, created_at) FROM stdin;
30	1	saida	1	service_526	Utilizado no cliente: Aduern	2025-12-10 17:22:33.14687
31	1	saida	1	service_527	Utilizado no cliente: Mastercar	2025-12-17 20:30:08.644181
\.


--
-- Data for Name: inventory_products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.inventory_products (id, name, description, price, quantity, min_alert, status, created_at, updated_at) FROM stdin;
1	Fonte ATX 12v 200w	\N	120.00	4	2	ativo	2025-12-01 22:40:31.280011	2025-12-17 20:30:08.718
\.


--
-- Data for Name: inventory_services; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.inventory_services (id, name, description, price, category, status, created_at, updated_at) FROM stdin;
1	teste	\N	150.00	\N	ativo	2025-12-01 22:31:06.798631	2025-12-01 22:31:06.798631
\.


--
-- Data for Name: knowledge_base; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.knowledge_base (id, title, category, problem, solution, keywords, tags, views, helpful, user_id, created_at, updated_at) FROM stdin;
1	Teste KB	software	Problema de teste	Solução de teste	\N	\N	0	0	1	2025-11-24 00:52:14.211106	2025-11-24 00:52:14.211106
2	Título do problema/macete	software	Descrição aqui	Solução aqui		\N	0	0	1	2025-11-24 10:30:37.675105	2025-11-24 10:30:37.675105
3	Comando conta local windows 11	outro	Comando que força o windows a criar conta local	start ms-cxh:localonly		\N	0	0	1	2025-12-27 13:25:05.932952	2025-12-27 13:25:05.932952
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.messages (id, client_id, title, content, category, created_at, updated_at) FROM stdin;
5	8	Backup smart	Verificar Google drive periodicamente 	cliente	2025-06-24 02:00:13.704969	2025-06-24 02:00:13.704969
6	6	Garotinho simples	Chefe	cliente	2025-06-24 02:01:06.752912	2025-06-24 02:01:06.752912
7	8	Ok	Ok	cliente	2025-06-24 02:01:49.007996	2025-06-24 02:01:49.007996
1	\N	Teste	Faz assim 	metodo	2025-09-18 02:34:21.609668	2025-09-18 02:34:21.609668
2	\N	teste	jgjuhgfjhukgjhgjhgjhkgjkhfgjhf	outros	2025-11-24 14:29:56.199752	2025-11-24 14:29:56.199752
\.


--
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notification_preferences (id, user_id, notification_type, enabled, created_at, updated_at) FROM stdin;
20	9	call_created	t	2025-11-25 13:08:47.768819	2025-11-25 13:21:14.311
36	5	call_created	t	2025-11-25 16:35:00.302016	2025-11-25 16:35:00.302016
37	7	call_updated	t	2025-11-25 17:02:15.545667	2025-11-25 17:02:15.545667
38	5	call_updated	t	2025-11-25 17:02:15.983353	2025-11-25 17:02:15.983353
40	5	call_to_service	t	2025-11-25 17:02:22.528509	2025-11-25 17:02:22.528509
2	1	call_updated	t	2025-11-24 14:20:34.449726	2025-11-24 14:20:41.738
3	1	call_deleted	t	2025-11-24 14:20:34.717787	2025-11-24 14:20:41.737
41	7	service_updated	t	2025-11-25 17:02:34.328684	2025-11-25 17:02:34.328684
4	1	service_created	t	2025-11-24 14:20:34.734071	2025-11-24 14:20:41.74
5	1	service_updated	t	2025-11-24 14:20:34.829662	2025-11-24 14:20:41.875
6	1	service_deleted	t	2025-11-24 14:20:34.833443	2025-11-24 14:20:41.885
7	1	service_to_financial	t	2025-11-24 14:20:34.983362	2025-11-24 14:20:42.014
8	1	call_to_service	t	2025-11-24 14:20:34.98466	2025-11-24 14:20:42.014
9	1	financial_created	t	2025-11-24 14:20:34.998315	2025-11-24 14:20:42.024
10	1	financial_updated	t	2025-11-24 14:20:35.031131	2025-11-24 14:20:42.025
11	1	financial_deleted	t	2025-11-24 14:20:35.108243	2025-11-24 14:20:42.151
12	1	payment_received	t	2025-11-24 14:20:35.109803	2025-11-24 14:20:42.162
14	1	financial_discount	t	2025-11-24 14:20:35.267707	2025-11-24 14:20:42.286
13	1	financial_installment	t	2025-11-24 14:20:35.266176	2025-11-24 14:20:42.293
15	1	financial_payment	t	2025-11-24 14:20:35.276366	2025-11-24 14:20:42.313
16	1	financial_pdf	t	2025-11-24 14:20:35.315782	2025-11-24 14:20:42.33
17	1	financial_status_reversed	t	2025-11-24 14:20:35.393667	2025-11-24 14:20:42.427
18	7	call_created	t	2025-11-25 12:24:58.175249	2025-11-25 12:25:00.653
42	5	service_updated	t	2025-11-25 17:02:34.758307	2025-11-25 17:02:34.758307
43	7	service_to_financial	t	2025-11-25 18:27:40.629153	2025-11-25 18:27:40.629153
44	5	service_to_financial	t	2025-11-25 18:27:41.027928	2025-11-25 18:27:41.027928
1	1	call_created	t	2025-11-23 16:37:28.29146	2025-11-25 13:19:20.597
45	10	call_created	f	2025-11-26 00:07:45.247023	2025-11-26 00:07:57.627
47	10	call_updated	f	2025-11-26 00:07:45.394845	2025-11-26 00:07:57.782
19	9	call_updated	t	2025-11-25 13:08:42.228387	2025-11-25 13:20:41.913
29	9	payment_received	t	2025-11-25 13:20:24.643095	2025-11-25 13:20:42.05
32	9	financial_pdf	t	2025-11-25 13:20:24.685577	2025-11-25 13:20:42.101
24	9	call_deleted	t	2025-11-25 13:20:24.63535	2025-11-25 13:20:42.121
46	10	call_deleted	f	2025-11-26 00:07:45.388807	2025-11-26 00:07:57.785
21	9	service_created	t	2025-11-25 13:20:24.45331	2025-11-25 13:20:42.124
35	9	financial_discount	t	2025-11-25 13:20:24.695078	2025-11-25 13:20:42.145
23	9	service_updated	t	2025-11-25 13:20:24.634372	2025-11-25 13:20:42.142
30	9	financial_updated	t	2025-11-25 13:20:24.65223	2025-11-25 13:20:42.162
25	9	service_deleted	t	2025-11-25 13:20:24.636118	2025-11-25 13:20:42.17
31	9	call_to_service	t	2025-11-25 13:20:24.661162	2025-11-25 13:20:42.165
27	9	financial_deleted	t	2025-11-25 13:20:24.637683	2025-11-25 13:20:42.148
22	9	financial_installment	t	2025-11-25 13:20:24.630292	2025-11-25 13:20:42.172
26	9	service_to_financial	t	2025-11-25 13:20:24.636952	2025-11-25 13:20:42.173
28	9	financial_created	t	2025-11-25 13:20:24.641007	2025-11-25 13:20:42.2
33	9	financial_payment	t	2025-11-25 13:20:24.695146	2025-11-25 13:20:42.188
34	9	financial_status_reversed	t	2025-11-25 13:20:24.695479	2025-11-25 13:20:42.183
80	5	financial_updated	t	2025-11-26 01:36:27.522977	2025-11-26 01:36:27.522977
48	10	service_created	f	2025-11-26 00:07:45.402198	2025-11-26 00:07:57.786
49	10	service_updated	f	2025-11-26 00:07:45.539147	2025-11-26 00:07:57.796
50	10	service_deleted	f	2025-11-26 00:07:45.661638	2025-11-26 00:07:57.799
51	10	call_to_service	f	2025-11-26 00:07:45.668828	2025-11-26 00:07:57.915
52	10	service_to_financial	f	2025-11-26 00:07:45.676725	2025-11-26 00:07:58.056
53	10	financial_created	f	2025-11-26 00:07:45.782941	2025-11-26 00:07:58.063
54	10	financial_updated	f	2025-11-26 00:07:45.794395	2025-11-26 00:07:58.067
56	10	payment_received	f	2025-11-26 00:07:45.93721	2025-11-26 00:07:58.079
55	10	financial_deleted	f	2025-11-26 00:07:45.815215	2025-11-26 00:07:58.08
57	10	financial_discount	f	2025-11-26 00:07:45.943027	2025-11-26 00:07:58.192
58	10	financial_installment	f	2025-11-26 00:07:45.946935	2025-11-26 00:07:58.33
59	10	financial_payment	f	2025-11-26 00:07:46.052189	2025-11-26 00:07:58.337
60	10	financial_pdf	f	2025-11-26 00:07:46.077646	2025-11-26 00:07:58.344
61	10	financial_status_reversed	f	2025-11-26 00:07:46.103936	2025-11-26 00:07:58.354
62	7	financial_pdf	t	2025-11-26 01:03:51.682811	2025-11-26 01:03:51.682811
63	5	financial_pdf	t	2025-11-26 01:03:52.081164	2025-11-26 01:03:52.081164
64	1	installment_created	t	2025-11-26 01:05:38.932841	2025-11-26 01:05:38.932841
66	5	installment_created	t	2025-11-26 01:05:39.957804	2025-11-26 01:05:39.957804
68	5	payment_received	t	2025-11-26 01:06:44.517754	2025-11-26 01:06:44.517754
70	5	financial_deleted	t	2025-11-26 01:07:04.389872	2025-11-26 01:07:04.389872
71	1	discount_applied	t	2025-11-26 01:17:48.20825	2025-11-26 01:17:48.20825
72	7	discount_applied	t	2025-11-26 01:17:48.84517	2025-11-26 01:17:48.84517
73	5	discount_applied	t	2025-11-26 01:17:49.238696	2025-11-26 01:17:49.238696
74	7	financial_status_reversed	t	2025-11-26 01:18:42.111931	2025-11-26 01:18:42.111931
75	5	financial_status_reversed	t	2025-11-26 01:18:42.503503	2025-11-26 01:18:42.503503
76	1	quote_generated	t	2025-11-26 01:34:47.278527	2025-11-26 01:34:47.278527
77	7	quote_generated	t	2025-11-26 01:34:47.941798	2025-11-26 01:34:47.941798
78	5	quote_generated	t	2025-11-26 01:34:48.336448	2025-11-26 01:34:48.336448
79	7	financial_updated	t	2025-11-26 01:36:27.135102	2025-11-26 01:36:27.135102
81	1	user_created	t	2025-11-26 01:44:46.838936	2025-11-26 01:44:46.838936
83	5	user_created	t	2025-11-26 01:44:47.899899	2025-11-26 01:44:47.899899
84	7	service_created	t	2025-11-26 02:18:59.585295	2025-11-26 02:18:59.585295
85	5	service_created	t	2025-11-26 02:18:59.971354	2025-11-26 02:18:59.971354
86	1	client_created	t	2025-11-26 13:13:59.713801	2025-11-26 13:13:59.713801
88	5	client_created	t	2025-11-26 13:14:00.748834	2025-11-26 13:14:00.748834
89	7	call_deleted	f	2025-12-01 18:38:26.351729	2025-12-01 18:38:26.351729
90	7	service_deleted	f	2025-12-01 18:38:34.648399	2025-12-01 18:38:34.648399
39	7	call_to_service	f	2025-11-25 17:02:22.052037	2025-12-01 18:38:39.976
69	7	financial_deleted	f	2025-11-26 01:07:03.996931	2025-12-01 18:38:47.725
94	7	client_deleted	f	2025-12-01 18:39:16.302767	2025-12-01 18:39:16.302767
67	7	payment_received	t	2025-11-26 01:06:44.134981	2025-12-01 18:38:52.067
91	7	financial_discount	f	2025-12-01 18:38:55.483466	2025-12-01 18:38:55.483466
65	7	installment_created	f	2025-11-26 01:05:39.558888	2025-12-01 18:38:59.988
92	7	parcelamento_created	f	2025-12-01 18:39:03.722446	2025-12-01 18:39:03.722446
93	7	client_note_deleted	f	2025-12-01 18:39:10.431417	2025-12-01 18:39:10.431417
87	7	client_created	f	2025-11-26 13:14:00.350231	2025-12-01 18:39:14.67
95	7	client_updated	f	2025-12-01 18:39:17.629993	2025-12-01 18:39:17.629993
96	7	quote_updated	f	2025-12-01 18:39:21.239083	2025-12-01 18:39:21.239083
82	7	user_created	f	2025-11-26 01:44:47.504947	2025-12-01 18:39:26.053
97	7	user_updated	f	2025-12-01 18:39:27.636322	2025-12-01 18:39:27.636322
98	1	KNOWLEDGE_BASE_CREATED	t	2025-12-27 13:25:06.075765	2025-12-27 13:25:06.075765
\.


--
-- Data for Name: preventive_maintenance; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.preventive_maintenance (id, client_id, title, description, equipment_type, frequency, scheduled_date, completed_date, status, notes, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quotes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.quotes (id, call_id, client_id, items, subtotal, discount, total, status, valid_until, created_at, title, description) FROM stdin;
6	\N	89	[{"type":"servico","description":"Serviço de análise, projeção e execução. Inclui instalação completa da infraestrutura de rede, passagem de cabos para todos os pontos, configuração do servidor DHCP para receber o link de internet e realizar a distribuição. Instalação e configuração de dois roteadores, sendo um no Térreo e outro no 1º andar. Sistema de CFTV: passagem de cabos das câmeras até o local do DVR, instalação e configuração de 4 câmeras internas, DVR com HD para backup e acesso remoto para visualização. Finalizado com orientação de uso ao cliente.","amount":"2000.00"},{"type":"produto","description":"Sistema CFTV. Inclui: 4 Câmeras Intelbras VHC 1320C Bullet. DVR Intelbras MHDX 1304. S/ HD. ","amount":"1250.00"},{"type":"produto","description":"1 HD SATA Seagate CFTV 2TB.","amount":"650.00"},{"type":"produto","description":"1 Fonte chaveada para alimentação do sistema de CFTV. ","amount":"80.00"},{"type":"produto","description":"4 Caixas VBOX para organizar conectores das câmeras no teto.","amount":"65.00"},{"type":"produto","description":"4 Pares de Ballun. Conector de vídeo para as câmeras.","amount":"100.00"},{"type":"produto","description":"4 Conectores P4. Para alimentação das câmeras. ","amount":"20.00"},{"type":"produto","description":"2 CX Cabos de rede CAT5.E 100% Cobre. (1 caixa para rede, 1 caixa para câmeras)","amount":"1800.00"},{"type":"produto","description":"2 Roteadores Intelbras W6 Giga. 1 para o Térreo. (1 para 1°andar)","amount":"700.00"},{"type":"produto","description":"1 Switch Intelbras Giga 8P.  ( Para fazer a distruição da rede a cabo dentro da caixa de passagem dos cabos)","amount":"250.00"},{"type":"servico","description":"Logistica Mossoró/Tibau 2 dias. Dois Tecnicos.","amount":"120.00"}]	100.00	\N	7035.00	pendente	\N	2025-08-12 00:55:00.072283	Infraestrtura de rede e CFTV	
9	\N	95	[{"type":"servico","description":"Instalação do serviço de nuvem Google Drive no computador e celular, configuração de backup e cópias de sombra para maior segurança, além de orientação de uso aos usuários.","amount":"350"},{"type":"produto","description":"Assinatura anual do Google Drive 200gb. (Valido por 1 ano) (Assinatura paga direto com o Google)","amount":"124.90"}]	100.00	\N	474.90	pendente	\N	2025-08-21 12:54:40.163251	Instalação, configuração e orientação do Uso backup em nuvem. 	
12	\N	108	[{"type":"produto","description":"Desktop Lenovo Thinkcentre E73 -  Processador Core i3 + 8gb Memória RAM + ssd 128 gb + HD 500gb","amount":"900"},{"type":"produto","description":"Monitor 19\\" Dell usado com marcas de uso, tela seminova","amount":"350"},{"type":"produto","description":"Desktop Dell 3020 - Processador Core i5 + 8gb Memória RAM + ssd 128 gb + HD 500gb","amount":"1200"},{"type":"produto","description":"Monitor 19\\" Dell Usado, porém muito conservado","amount":"450"}]	100.00	\N	2900.00	pendente	\N	2025-09-22 11:43:08.797281	Desktops Lenovo e Dell	Orçamento de máquinas
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.services (id, name, description, base_price, estimated_time, category, client_id, created_at, products, service_date, user_id, created_by_user_id, call_date, call_id, priority) FROM stdin;
583	João da Escóssia - resolução problema da rede. 	João da Escóssia - resolução problema da rede. 	\N	\N	\N	28	2026-01-15 13:05:40.62782	\N	2026-01-15 03:00:00	9	9	\N	\N	media
563	Fonte e filtro de linha	Fonte tv e filtro de linha	\N	\N	\N	94	2026-01-05 12:09:23.269289	\N	2026-01-05 03:00:00	9	9	\N	\N	media
157	Impressora Samsung da digitação enganchando papel. 	Máquina com George para análise	100.00	2 horas	Reparo	9	2025-08-06 03:00:00	\N	2025-08-06 03:00:00	5	9	\N	\N	media
566	Som	Ligação do som.  Fazer nota mandar. 	\N	\N	\N	62	2026-01-08 15:46:10.07763	\N	2026-01-08 03:00:00	9	9	\N	\N	media
308	Visita técnica antiga policlínica para analisar e passar orçamento de serviço para instalar e configurar estrutura de rede e computadores . 		100.00	2 horas	Reparo	101	2025-10-23 03:00:00	\N	2025-10-23 03:00:00	5	9	2025-10-22 04:18:58.949	295	media
455	Pc depósito reiniciando sozinho	\N	0.00	2 horas	Reparo	67	2025-11-22 15:29:29.591	[{"name":"Configuração de sistema. Não suspender. (CORTESIA)","description":"Configuração de sistema. Não suspender. (CORTESIA)","type":"servico","unitPrice":0.001,"price":0.001,"amount":0.001,"quantity":1}]	2025-11-25 02:54:43.054	9	9	2025-10-29 03:00:00	109	media
584	Taffarel - Configuração de máquina na rede	Taffarel - Configuração de máquina na rede	150.00	\N	\N	171	2026-01-15 15:32:27.335727	[{"name":"Acesso remoto para configurar e parametrizar máquina de exames em rede/roteador. Deixando com IP fixo no desktop e máquina de exames. ","description":"Acesso remoto para configurar e parametrizar máquina de exames em rede/roteador. Deixando com IP fixo no desktop e máquina de exames. ","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1}]	2026-01-15 03:00:00	9	9	\N	\N	media
573	Pegar note para fazer baixa. \nRua Rolô Eufrásio, 29, abolição 3.\nRua por trás da Igreja São Francisco	\N	150.00	2 horas	Reparo	179	2026-01-13 18:38:57.909266	[{"name":"Backup, formatação, reinstalação e configuração do sistema operacional e programas. Deixando pronto pra uso e com suporte posterior caso precise.  ","description":"Backup, formatação, reinstalação e configuração do sistema operacional e programas. Deixando pronto pra uso e com suporte posterior caso precise.  ","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1}]	2026-01-13 18:38:57.286	9	9	2026-01-09 11:08:27.757	290	media
575	Verificar  problema no computador Gustavo Rosada, que não está ligando.	\N	100.00	2 horas	Reparo	8	2026-01-14 11:17:49.871245	\N	2026-01-14 11:17:49.219	7	7	2026-01-06 21:47:43.229	285	media
585	Substituição de Armazenamento (SSD)	Substituição do SDD de 120Gb por um de 256Gb	435.00	\N	\N	83	2026-01-16 14:17:05.957403	[{"name":"SSD Goldenfir 256Gb. 1 Ano de Garantia ","description":"SSD Goldenfir 256Gb. 1 Ano de Garantia ","type":"produto","unitPrice":285,"price":285,"amount":285,"quantity":1},{"name":"Formatação + Configurações dos programas básicos ","description":"Formatação + Configurações dos programas básicos ","type":"servico","unitPrice":150,"price":150,"amount":150,"quantity":1}]	2026-01-16 03:00:00	7	7	\N	\N	media
586	Desktop pra analisar. 	\N	100.00	2 horas	Reparo	120	2026-01-19 13:14:59.671492	\N	2026-01-19 13:14:58.657	9	9	2026-01-15 12:57:40.475	299	media
587	Cameras da casa 	\N	100.00	2 horas	Reparo	120	2026-01-19 13:15:10.300429	\N	2026-01-19 13:15:09.3	9	9	2026-01-15 12:57:17.742	298	media
588	Abel IMP diretoria	Abel  IMP diretoria	\N	\N	\N	9	2026-01-20 15:39:08.868368	\N	2026-01-20 03:00:00	9	9	\N	\N	media
564	Deixar HDTV	\N	100.00	2 horas	Reparo	94	2026-01-05 12:09:40.64037	\N	2026-01-05 12:09:39.287	9	9	2025-12-30 14:44:05.853	280	media
582	IMP recepção Bestlaser	IMP recepção Bestlaser	0.00	\N	\N	24	2026-01-14 15:52:15.238024	[{"name":"Diagnóstico e resolução impressora Epson L3150 recepção. Desentupimento dos bicos/cabeça de impressão, limpeza interna e lubrificação. ","description":"Diagnóstico e resolução impressora Epson L3150 recepção. Desentupimento dos bicos/cabeça de impressão, limpeza interna e lubrificação. ","type":"servico","unitPrice":0,"price":0,"amount":0,"quantity":1}]	2026-01-14 03:00:00	9	9	\N	\N	media
537	Pegar note na Jacaúna	\N	871.00	2 horas	Reparo	168	2025-12-15 16:43:10.169856	[{"name":"Diagnóstico e resolução. Montagem da máquina com upgrade de memória e SSD + troca da tela e limpeza interna de hardware. Backup, formatação,  instalação, atualização e configuração do sistema operacional e programas. ","description":"Diagnóstico e resolução. Montagem da máquina com upgrade de memória e SSD + troca da tela e limpeza interna de hardware. Backup, formatação,  instalação, atualização e configuração do sistema operacional e programas. ","type":"servico","unitPrice":1,"price":1,"amount":1,"quantity":1},{"name":"Notebook Sony Vaio usado. Com tudo funcionando. De onde vamos tirar as peças que estamos precisamos pra resolver.","description":"Notebook Sony Vaio usado. Com tudo funcionando. De onde vamos tirar as peças que estamos precisamos pra resolver.","type":"produto","unitPrice":650,"price":650,"amount":650,"quantity":1},{"name":"SSD SATA 128gb KingSpec. (1 ANO GARANTIA)","description":"SSD SATA 128gb KingSpec. (1 ANO GARANTIA)","type":"produto","unitPrice":220,"price":220,"amount":220,"quantity":1}]	2025-12-15 16:43:09.186	9	9	2025-12-05 13:14:31.643	250	media
530	Mikrotik Failover e Loadbalance.	Mikrotik Failover e Loadbalance.	550.00	\N	\N	134	2025-12-13 02:31:25.194995	[{"name":"Otimização de desempenho e disponibilidade de rede e conexões: Configuração de balanceamento de carga (Load Balancing) e garantia de alta disponibilidade de internet (Failover) no roteador MikroTik. Suporte e Garantia.","description":"Otimização de desempenho e disponibilidade de rede e conexões: Configuração de balanceamento de carga (Load Balancing) e garantia de alta disponibilidade de internet (Failover) no roteador MikroTik. Suporte e Garantia.","type":"servico","unitPrice":550,"price":550,"amount":550,"quantity":1}]	2026-01-16 03:00:00	9	9	\N	\N	media
532	Pc Rose recepção ficando sem conexão. 	\N	100.00	2 horas	Reparo	84	2025-12-13 02:46:26.566395	\N	2025-12-13 02:46:26.174	9	9	2025-12-02 12:25:44.096	241	media
565	Manutenção dois desktop Rômulo.	*GABINETE BRANCO*\nLimpeza Fisica completa\nFormatação\nAjeitar ou substituir o cooler frontal e o traseiro que não estão rodando\ntirar o Hd HDD, formatar e instalar como unidade extra no gabinete preto\n\n*GABINETE PRETO*\nLimpeza Fisica Completa\nFormatação\nChecar placa de video que parou de funcionar, se ela ainda consegue rodar, se não, tirar logo ela, pois não ta servindo de nada\nDizer se tem placa de video no mercado, nova ou usada que possa funcionar\nInstalar HD HDD que vai ser retirado do gabinete branco	\N	\N	\N	46	2026-01-05 12:12:25.133824	\N	2026-01-05 03:00:00	9	9	\N	\N	media
541	Resolução telefones.	\N	100.00	2 horas	Reparo	28	2025-12-16 15:44:48.98271	\N	2025-12-16 15:44:48.115	9	9	2025-12-13 22:05:45.423	261	media
542	Ajustes das câmeras e configuração de tela remota DVR HBtech diretoria. 	\N	100.00	2 horas	Reparo	28	2025-12-16 15:44:53.929269	\N	2025-12-16 15:44:53.313	9	9	2025-12-15 13:03:14.302	262	media
550	Problemas rede cabeada. Levar um Switch. 	\N	100.00	2 horas	Reparo	175	2025-12-26 19:17:00.765079	\N	2025-12-26 19:17:02.262	9	9	2025-12-23 11:56:11.747	274	media
551	Note de Kew não liga. 	\N	100.00	2 horas	Reparo	24	2025-12-26 19:23:02.579932	\N	2025-12-26 19:23:03.954	9	9	2025-12-20 13:54:03.026	269	media
545	Manutenção impressora Brother do caixa	Manutenção preventiva. Impressora esquentando muito, possível problema nos sensores de temperatura.	\N	\N	\N	41	2025-12-17 20:29:15.985038	\N	2025-12-17 03:00:00	1	1	\N	\N	media
547	Manutenção servidor loja santo Antônio	\N	100.00	2 horas	Reparo	175	2025-12-22 11:30:23.104973	\N	2025-12-22 11:30:20.79	9	9	2025-12-20 13:53:44.262	268	media
552	Reparo placa Lenovo.	Reparo placa Lenovo. Com Claudinho. 	\N	\N	\N	62	2025-12-26 19:24:42.237337	\N	2025-12-26 03:00:00	9	9	\N	\N	media
553	Rômulo 2 desktop.	Rômulo 2 desktop.	\N	\N	\N	\N	2025-12-26 19:25:28.370925	\N	2025-12-26 03:00:00	9	9	\N	\N	media
557	Verificar notebook.  	\N	100.00	2 horas	Reparo	25	2026-01-04 00:13:19.359602	\N	2026-01-04 00:13:17.891	9	9	2025-12-30 14:32:25.631	279	media
560	Problema wpp	\N	100.00	2 horas	Reparo	8	2026-01-04 00:14:54.582049	\N	2026-01-04 00:14:53.548	9	9	2025-12-15 13:04:07.191	264	media
\.


--
-- Data for Name: signature_attempts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.signature_attempts (id, user_id, attempt_count, last_attempt, blocked_until) FROM stdin;
\.


--
-- Data for Name: signature_audit_log; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.signature_audit_log (id, certificate_id, document_type, document_id, user_id, signed_at, ip_address, status, error_message, created_at) FROM stdin;
1	1	quotation	521	1	2025-12-10 13:02:12.135172	\N	success	\N	2025-12-10 13:02:12.135172
2	1	service_note	1198	1	2025-12-10 13:03:21.459671	\N	success	\N	2025-12-10 13:03:21.459671
3	1	quotation	512	1	2025-12-10 13:05:54.795345	\N	success	\N	2025-12-10 13:05:54.795345
4	1	service_note	1193	1	2025-12-10 13:06:26.115342	\N	success	\N	2025-12-10 13:06:26.115342
5	1	service_note	1198	1	2025-12-10 13:09:57.034644	\N	success	\N	2025-12-10 13:09:57.034644
6	1	service_note	1198	1	2025-12-10 13:39:48.595113	\N	failed	Erro ao assinar PDF: WinAnsi cannot encode "✓" (0x2713)	2025-12-10 13:39:48.595113
7	1	service_note	1198	1	2025-12-10 13:41:47.890072	\N	failed	Erro ao assinar PDF: WinAnsi cannot encode "✓" (0x2713)	2025-12-10 13:41:47.890072
8	1	service_note	1198	1	2025-12-10 13:41:57.547616	\N	failed	Erro ao assinar PDF: WinAnsi cannot encode "✓" (0x2713)	2025-12-10 13:41:57.547616
9	1	service_note	1198	1	2025-12-10 13:44:22.920459	\N	failed	Erro ao assinar PDF: WinAnsi cannot encode "✓" (0x2713)	2025-12-10 13:44:22.920459
10	1	service_note	1198	1	2025-12-10 13:48:27.248946	\N	failed	Erro ao assinar PDF: WinAnsi cannot encode "✓" (0x2713)	2025-12-10 13:48:27.248946
11	1	service_note	1198	1	2025-12-10 13:52:10.413024	\N	success	\N	2025-12-10 13:52:10.413024
12	1	service_note	1198	1	2025-12-10 14:01:42.163209	\N	success	\N	2025-12-10 14:01:42.163209
13	1	service_note	1198	1	2025-12-10 14:04:50.118257	\N	success	\N	2025-12-10 14:04:50.118257
14	1	service_note	1198	1	2025-12-10 14:10:19.320957	\N	success	\N	2025-12-10 14:10:19.320957
15	1	quotation	521	1	2025-12-10 14:13:42.360534	\N	success	\N	2025-12-10 14:13:42.360534
\.


--
-- Data for Name: system_activation; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.system_activation (id, password_hash, hardware_fingerprint, failed_attempts, blocked_until, activated_at, last_attempt) FROM stdin;
6	Apoiotec1@Informatica	3007c6971183d5c92acf39523a21c9f0834ca181cea60ac3de002e7b427e9f91	0	\N	2025-12-03 21:34:44.47861	\N
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.system_settings (id, company_name, cnpj, address, phone, email, font_size, font_family, theme, primary_color, secondary_color, logo, created_at, updated_at, pdf_font_size, pdf_subtitle, pdf_phone1, pdf_phone2, card_layout) FROM stdin;
1	Apoiotec Informática	15.292.813.0001-70				24	system	light	#0011ff	#00ffff	\N	2025-10-15 12:23:56.732525	2025-12-03 15:02:44.869	16	Assessoria e Assistência Técnica em Informática	84988288543	84988363828	double
\.


--
-- Data for Name: telegram_config; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.telegram_config (id, bot_token, chat_id, is_active, created_at, updated_at, user_id) FROM stdin;
2	8490406791:AAEgYIxTLsdSqKWjKi8QbfTXowDIUHdhs5c	1920774815	t	2025-11-23 01:50:19.717089	2025-11-23 12:56:09.027	1
3	8490406791:AAEgYIxTLsdSqKWjKi8QbfTXowDIUHdhs5c	5714497054	t	2025-11-23 14:28:53.874197	2025-11-23 14:55:15.642	7
4	8490406791:AAEgYIxTLsdSqKWjKi8QbfTXowDIUHdhs5c	914326745	t	2025-11-23 23:57:03.704305	2025-11-23 23:57:03.704305	5
\.


--
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.templates (id, name, type, company_name, company_address, company_phone, company_email, logo_url, content, header_content, footer_content, custom_css, font_size, title_font_size, header_alignment, content_alignment, logo_size, primary_color, secondary_color, font_family, line_height, margin_top, margin_bottom, margin_left, margin_right, border_color, border_width, background_color, is_default, created_at, updated_at) FROM stdin;
8	Recibo	recibo	Apoiotec Informática	Rua da Tecnologia, 123 - Centro	(11) 99999-9999	contato@apoiotec.com.br	\N	\n<div class="document-header">\n  <div class="company-info">\n    <div class="company-name">{{empresa_nome}}</div>\n    <div class="company-details">\n      CNPJ: {{empresa_cnpj}}<br>\n      {{empresa_endereco}}<br>\n      Telefone: {{empresa_telefone}}<br>\n      Email: {{empresa_email}}\n    </div>\n  </div>\n  <div class="document-title">RECIBO Nº {{numero_recibo}}</div>\n</div>\n\n<div class="client-section">\n  <h3 class="section-title">DADOS DO CLIENTE</h3>\n  <div class="client-details">\n    <div class="info-grid">\n      <div class="info-item">\n        <span class="info-label">Nome:</span>\n        <span class="info-value">{{cliente_nome}}</span>\n      </div>\n      <div class="info-item">\n        <span class="info-label">Telefone:</span>\n        <span class="info-value">{{cliente_telefone}}</span>\n      </div>\n      <div class="info-item">\n        <span class="info-label">Email:</span>\n        <span class="info-value">{{cliente_email}}</span>\n      </div>\n      <div class="info-item">\n        <span class="info-label">Data:</span>\n        <span class="info-value">{{data}}</span>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class="service-section">\n  <h3 class="section-title">DESCRIÇÃO DO PAGAMENTO</h3>\n  <div class="service-content">\n    <div class="service-description">\n      <strong>Referente a:</strong><br>\n      <div class="description-box">{{descricao}}</div>\n    </div>\n  </div>\n</div>\n\n<div class="breakdown-section">\n  <h3 class="section-title">DISCRIMINAÇÃO DE VALORES</h3>\n  <div class="breakdown-content">\n    {{tabela_discriminacao}}\n  </div>\n</div>\n\n<div class="value-section">\n  <div class="value-container">\n    <div class="value-label">VALOR TOTAL PAGO</div>\n    <div class="value-amount">{{valor_total}}</div>\n  </div>\n</div>\n\n<div class="footer-section">\n  <div class="signature-area">\n    <div class="signature-line"></div>\n    <div class="signature-label">Assinatura do Responsável</div>\n  </div>\n  <div class="date-info">\n    <p>Documento gerado em {{data_geracao}}</p>\n    <p class="validity">Este recibo comprova o pagamento pelos serviços prestados.</p>\n  </div>\n</div>\n\n<style>\n  .document-header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #2563eb; }\n  .company-name { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }\n  .company-details { font-size: 12px; color: #666; line-height: 1.4; }\n  .document-title { font-size: 20px; font-weight: bold; color: #2563eb; margin-top: 15px; background: #f0f8ff; padding: 10px; border-radius: 5px; }\n  .section-title { background: #2563eb; color: white; padding: 8px 15px; margin: 0 0 15px 0; font-size: 14px; font-weight: bold; }\n  .client-section, .service-section, .breakdown-section { margin-bottom: 25px; }\n  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }\n  .info-item { background: #f8f9fa; padding: 8px; border-radius: 4px; }\n  .info-label { font-weight: bold; color: #333; }\n  .info-value { color: #666; margin-left: 5px; }\n  .service-description { margin-bottom: 15px; }\n  .description-box { background: #f0f8ff; border: 1px solid #2563eb; padding: 15px; margin-top: 8px; border-radius: 5px; line-height: 1.5; }\n  .breakdown-content { background: #f8f9fa; border: 1px solid #ddd; border-radius: 5px; padding: 15px; }\n  .value-section { background: #f0f8ff; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }\n  .value-label { font-size: 16px; font-weight: bold; color: #2563eb; margin-bottom: 8px; }\n  .value-amount { font-size: 28px; font-weight: bold; color: #2563eb; }\n  .footer-section { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; }\n  .signature-area { width: 300px; }\n  .signature-line { border-bottom: 2px solid #333; margin-bottom: 5px; height: 60px; }\n  .signature-label { text-align: center; font-size: 12px; color: #666; }\n  .date-info { text-align: right; font-size: 11px; color: #666; }\n  .validity { font-style: italic; margin-top: 5px; }\n</style>	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2025-06-27 02:49:04.454667	2025-06-27 02:49:04.454667
6	Relatórios	relatorio	TESTE ATUALIZADO	Rua da Tecnologia, 123 - Centro - São Paulo/SP	(11) 99999-9999	contato@apoiotec.com.br	\N	\n<div class="document-header">\n  <div class="company-info">\n    <div class="company-name">{{empresa_nome}}</div>\n    <div class="company-details">\n      CNPJ: {{empresa_cnpj}}<br>\n      {{empresa_endereco}}<br>\n      Telefone: {{empresa_telefone}}<br>\n      Email: {{empresa_email}}\n    </div>\n  </div>\n  <div class="document-title">RELATÓRIO FINANCEIRO</div>\n</div>\n\n<div class="period-section">\n  <h3 class="section-title">PERÍODO DO RELATÓRIO</h3>\n  <div class="period-details">\n    <div class="info-grid">\n      <div class="info-item">\n        <span class="info-label">Data de Geração:</span>\n        <span class="info-value">{{data_geracao}}</span>\n      </div>\n      <div class="info-item">\n        <span class="info-label">Relatório:</span>\n        <span class="info-value">Movimentação Financeira</span>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class="transactions-section">\n  <h3 class="section-title">TRANSAÇÕES FINANCEIRAS</h3>\n  <div class="transactions-content">\n    {{tabela_transacoes}}\n  </div>\n</div>\n\n<div class="summary-section">\n  <h3 class="section-title">RESUMO FINANCEIRO</h3>\n  <div class="summary-content">\n    <div class="summary-grid">\n      <div class="summary-item entrada">\n        <span class="summary-label">Total de Entradas:</span>\n        <span class="summary-value">{{total_entradas}}</span>\n      </div>\n      <div class="summary-item saida">\n        <span class="summary-label">Total de Saídas:</span>\n        <span class="summary-value">{{total_saidas}}</span>\n      </div>\n      <div class="summary-item saldo">\n        <span class="summary-label">Saldo do Período:</span>\n        <span class="summary-value">{{saldo_periodo}}</span>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class="footer-section">\n  <div class="date-info">\n    <p>Relatório gerado automaticamente em {{data_geracao}}</p>\n    <p class="validity">Este documento apresenta a movimentação financeira do período especificado.</p>\n  </div>\n</div>\n\n<style>\n  .document-header {\n    text-align: center;\n    margin-bottom: 30px;\n    padding-bottom: 20px;\n    border-bottom: 3px solid #2563eb;\n  }\n  .company-name {\n    font-size: 24px;\n    font-weight: bold;\n    color: #2563eb;\n    margin-bottom: 10px;\n  }\n  .company-details {\n    font-size: 12px;\n    color: #666;\n    line-height: 1.4;\n  }\n  .document-title {\n    font-size: 20px;\n    font-weight: bold;\n    color: #2563eb;\n    margin-top: 15px;\n    background: #f0f8ff;\n    padding: 10px;\n    border-radius: 5px;\n  }\n  .section-title {\n    background: #2563eb;\n    color: white;\n    padding: 8px 15px;\n    margin: 0 0 15px 0;\n    font-size: 14px;\n    font-weight: bold;\n  }\n  .period-section, .transactions-section, .summary-section {\n    margin-bottom: 25px;\n  }\n  .info-grid {\n    display: grid;\n    grid-template-columns: 1fr 1fr;\n    gap: 10px;\n  }\n  .info-item {\n    background: #f8f9fa;\n    padding: 8px;\n    border-radius: 4px;\n  }\n  .info-label {\n    font-weight: bold;\n    color: #333;\n  }\n  .info-value {\n    color: #666;\n    margin-left: 5px;\n  }\n  .transactions-content {\n    background: #f8f9fa;\n    border: 1px solid #ddd;\n    border-radius: 5px;\n    padding: 15px;\n  }\n  .summary-content {\n    background: #f0f8ff;\n    border: 1px solid #2563eb;\n    border-radius: 5px;\n    padding: 15px;\n  }\n  .summary-grid {\n    display: grid;\n    grid-template-columns: 1fr 1fr 1fr;\n    gap: 15px;\n  }\n  .summary-item {\n    text-align: center;\n    padding: 15px;\n    border-radius: 5px;\n    background: white;\n    border: 1px solid #ddd;\n  }\n  .summary-item.entrada {\n    border-left: 4px solid #16a34a;\n  }\n  .summary-item.saida {\n    border-left: 4px solid #dc2626;\n  }\n  .summary-item.saldo {\n    border-left: 4px solid #2563eb;\n  }\n  .summary-label {\n    display: block;\n    font-weight: bold;\n    color: #333;\n    margin-bottom: 5px;\n  }\n  .summary-value {\n    display: block;\n    font-size: 18px;\n    font-weight: bold;\n    color: #2563eb;\n  }\n  .footer-section {\n    margin-top: 40px;\n    text-align: center;\n  }\n  .date-info {\n    font-size: 11px;\n    color: #666;\n  }\n  .validity {\n    font-style: italic;\n    margin-top: 5px;\n  }\n</style>	\N	\N	\N	12px	\N	left	left	\N	#0007cc	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2025-06-26 22:28:13.731187	2025-06-26 23:36:55.575
3	Nota de Serviço	nota_servico	Apoiotec Informática	Rua da Tecnologia, 123, Centro	(11) 99999-9999	contato@apoiotec.com.br		\n<div class="document-header">\n  <div class="company-info">\n    <div class="company-name">{{empresa_nome}}</div>\n    <div class="company-details">\n      CNPJ: {{empresa_cnpj}}<br>\n      {{empresa_endereco}}<br>\n      Telefone: {{empresa_telefone}}<br>\n      Email: {{empresa_email}}\n    </div>\n  </div>\n  <div class="document-title">NOTA DE SERVIÇO Nº {{numero_nota}}</div>\n</div>\n\n<div class="client-section">\n  <h3 class="section-title">DADOS DO CLIENTE</h3>\n  <div class="client-details">\n    <div class="info-grid">\n      <div class="info-item">\n        <span class="info-label">Nome:</span>\n        <span class="info-value">{{cliente_nome}}</span>\n      </div>\n      <div class="info-item">\n        <span class="info-label">Telefone:</span>\n        <span class="info-value">{{cliente_telefone}}</span>\n      </div>\n      <div class="info-item">\n        <span class="info-label">Email:</span>\n        <span class="info-value">{{cliente_email}}</span>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class="service-section">\n  <h3 class="section-title">DETALHES DO SERVIÇO EXECUTADO</h3>\n  <div class="service-content">\n    <div class="service-description">\n      <strong>Descrição do Serviço:</strong><br>\n      <div class="description-box">{{descricao}}</div>\n    </div>\n    <div class="service-details">\n      <div class="detail-item">\n        <span class="detail-label">Data do Serviço:</span>\n        <span class="detail-value">{{data}}</span>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class="breakdown-section">\n  <h3 class="section-title">DISCRIMINAÇÃO DE VALORES</h3>\n  <div class="breakdown-content">\n    {{tabela_discriminacao}}\n  </div>\n</div>\n\n<div class="value-section">\n  <div class="value-container">\n    <div class="value-label">VALOR TOTAL DO SERVIÇO</div>\n    <div class="value-amount">{{valor_total}}</div>\n  </div>\n</div>\n\n<div class="footer-section">\n  <div class="signature-area">\n    <div class="signature-line"></div>\n    <div class="signature-label">Assinatura do Responsável Técnico</div>\n  </div>\n  <div class="date-info">\n    <p>Documento gerado em {{data_geracao}}</p>\n    <p class="validity">Este documento comprova a execução do serviço técnico especializado.</p>\n  </div>\n</div>\n\n<style>\n  .document-header {\n    text-align: center;\n    margin-bottom: 30px;\n    padding-bottom: 20px;\n    border-bottom: 3px solid #2563eb;\n  }\n  .company-name {\n    font-size: 24px;\n    font-weight: bold;\n    color: #2563eb;\n    margin-bottom: 10px;\n  }\n  .company-details {\n    font-size: 12px;\n    color: #666;\n    line-height: 1.4;\n  }\n  .document-title {\n    font-size: 20px;\n    font-weight: bold;\n    color: #2563eb;\n    margin-top: 15px;\n    background: #f0f8ff;\n    padding: 10px;\n    border-radius: 5px;\n  }\n  .section-title {\n    background: #2563eb;\n    color: white;\n    padding: 8px 15px;\n    margin: 0 0 15px 0;\n    font-size: 14px;\n    font-weight: bold;\n  }\n  .client-section, .service-section, .breakdown-section {\n    margin-bottom: 25px;\n  }\n  .info-grid {\n    display: grid;\n    grid-template-columns: 1fr 1fr;\n    gap: 10px;\n  }\n  .info-item {\n    background: #f8f9fa;\n    padding: 8px;\n    border-radius: 4px;\n  }\n  .info-label {\n    font-weight: bold;\n    color: #333;\n  }\n  .info-value {\n    color: #666;\n    margin-left: 5px;\n  }\n  .service-description {\n    margin-bottom: 15px;\n  }\n  .description-box {\n    background: #f0f8ff;\n    border: 1px solid #2563eb;\n    padding: 15px;\n    margin-top: 8px;\n    border-radius: 5px;\n    line-height: 1.5;\n  }\n  .service-details {\n    display: grid;\n    grid-template-columns: 1fr 1fr;\n    gap: 10px;\n  }\n  .detail-item {\n    background: #f8f9fa;\n    padding: 8px;\n    border-radius: 4px;\n  }\n  .detail-label {\n    font-weight: bold;\n    color: #333;\n  }\n  .detail-value {\n    color: #666;\n    margin-left: 5px;\n  }\n  .breakdown-content {\n    background: #f8f9fa;\n    border: 1px solid #ddd;\n    border-radius: 5px;\n    padding: 15px;\n  }\n  .value-section {\n    background: #f0f8ff;\n    border: 2px solid #2563eb;\n    border-radius: 8px;\n    padding: 20px;\n    text-align: center;\n    margin: 30px 0;\n  }\n  .value-label {\n    font-size: 16px;\n    font-weight: bold;\n    color: #2563eb;\n    margin-bottom: 8px;\n  }\n  .value-amount {\n    font-size: 28px;\n    font-weight: bold;\n    color: #2563eb;\n  }\n  .footer-section {\n    margin-top: 40px;\n    display: flex;\n    justify-content: space-between;\n    align-items: flex-end;\n  }\n  .signature-area {\n    width: 300px;\n  }\n  .signature-line {\n    border-bottom: 2px solid #333;\n    margin-bottom: 5px;\n    height: 60px;\n  }\n  .signature-label {\n    text-align: center;\n    font-size: 12px;\n    color: #666;\n  }\n  .date-info {\n    text-align: right;\n    font-size: 11px;\n    color: #666;\n  }\n  .validity {\n    font-style: italic;\n    margin-top: 5px;\n  }\n</style>				14px	28px	left	left	180px	#001eff	#6c757d	Arial, sans-serif	1.6	10px	10px	10px	10px	#007bff	1px	#ffffff	t	2025-06-25 20:54:25.219109	2025-06-27 15:41:54.289
5	Orçamento	orcamento	Apoiotec Informática	Rua da Tecnologia, 123, Centro	(11) 99999-9999	contato@apoiotec.com.br	https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/VhcFuVrAg3MXIbymNJ8a/pub/P75pBxEkA1M1lqHTkTSk/logo.png	\n<div class="document-header">\n  <div class="company-info">\n    <div class="company-name">{{empresa_nome}}</div>\n    <div class="company-details">\n      CNPJ: {{empresa_cnpj}}<br>\n      {{empresa_endereco}}<br>\n      Telefone: {{empresa_telefone}}<br>\n      Email: {{empresa_email}}\n    </div>\n  </div>\n  <div class="document-title">ORÇAMENTO Nº {{numero_orcamento}}</div>\n</div>\n\n<div class="client-section">\n  <h3 class="section-title">DADOS DO CLIENTE</h3>\n  <div class="client-details">\n    <div class="info-grid">\n      <div class="info-item">\n        <span class="info-label">Nome:</span>\n        <span class="info-value">{{cliente_nome}}</span>\n      </div>\n      <div class="info-item">\n        <span class="info-label">Telefone:</span>\n        <span class="info-value">{{cliente_telefone}}</span>\n      </div>\n      <div class="info-item">\n        <span class="info-label">Email:</span>\n        <span class="info-value">{{cliente_email}}</span>\n      </div>\n      <div class="info-item">\n        <span class="info-label">Data:</span>\n        <span class="info-value">{{data}}</span>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class="service-section">\n  <h3 class="section-title">DESCRIÇÃO DO ORÇAMENTO</h3>\n  <div class="service-content">\n    <div class="service-description">\n      <div class="description-box">{{descricao}}</div>\n    </div>\n  </div>\n</div>\n\n<div class="items-section">\n  <h3 class="section-title">ITENS ORÇADOS</h3>\n  <div class="items-content">\n    {{tabela_itens}}\n  </div>\n</div>\n\n<div class="value-section">\n  <div class="value-container">\n    <div class="value-label">VALOR TOTAL DO ORÇAMENTO</div>\n    <div class="value-amount">{{valor_total}}</div>\n  </div>\n</div>\n\n<div class="footer-section">\n  <div class="terms-info">\n    <h4>Condições Gerais:</h4>\n    <p>• Orçamento válido por 30 dias</p>\n    <p>• Pagamento à vista ou conforme negociação</p>\n    <p>• Garantia conforme legislação vigente</p>\n  </div>\n  <div class="date-info">\n    <p>Documento gerado em {{data_geracao}}</p>\n    <p class="validity">Este orçamento não constitui compromisso de compra.</p>\n  </div>\n</div>\n\n<style>\n  .document-header {\n    text-align: center;\n    margin-bottom: 30px;\n    padding-bottom: 20px;\n    border-bottom: 3px solid #2563eb;\n  }\n  .company-name {\n    font-size: 24px;\n    font-weight: bold;\n    color: #2563eb;\n    margin-bottom: 10px;\n  }\n  .company-details {\n    font-size: 12px;\n    color: #666;\n    line-height: 1.4;\n  }\n  .document-title {\n    font-size: 20px;\n    font-weight: bold;\n    color: #2563eb;\n    margin-top: 15px;\n    background: #f0f8ff;\n    padding: 10px;\n    border-radius: 5px;\n  }\n  .section-title {\n    background: #2563eb;\n    color: white;\n    padding: 8px 15px;\n    margin: 0 0 15px 0;\n    font-size: 14px;\n    font-weight: bold;\n  }\n  .client-section, .service-section, .items-section {\n    margin-bottom: 25px;\n  }\n  .info-grid {\n    display: grid;\n    grid-template-columns: 1fr 1fr;\n    gap: 10px;\n  }\n  .info-item {\n    background: #f8f9fa;\n    padding: 8px;\n    border-radius: 4px;\n  }\n  .info-label {\n    font-weight: bold;\n    color: #333;\n  }\n  .info-value {\n    color: #666;\n    margin-left: 5px;\n  }\n  .service-description {\n    margin-bottom: 15px;\n  }\n  .description-box {\n    background: #f0f8ff;\n    border: 1px solid #2563eb;\n    padding: 15px;\n    margin-top: 8px;\n    border-radius: 5px;\n    line-height: 1.5;\n  }\n  .items-content {\n    background: #f8f9fa;\n    border: 1px solid #ddd;\n    border-radius: 5px;\n    padding: 15px;\n  }\n  .value-section {\n    background: #f0f8ff;\n    border: 2px solid #2563eb;\n    border-radius: 8px;\n    padding: 20px;\n    text-align: center;\n    margin: 30px 0;\n  }\n  .value-label {\n    font-size: 16px;\n    font-weight: bold;\n    color: #2563eb;\n    margin-bottom: 8px;\n  }\n  .value-amount {\n    font-size: 28px;\n    font-weight: bold;\n    color: #2563eb;\n  }\n  .footer-section {\n    margin-top: 40px;\n    display: flex;\n    justify-content: space-between;\n    align-items: flex-start;\n  }\n  .terms-info {\n    width: 60%;\n  }\n  .terms-info h4 {\n    color: #2563eb;\n    margin-bottom: 10px;\n  }\n  .terms-info p {\n    font-size: 12px;\n    color: #666;\n    margin: 3px 0;\n  }\n  .date-info {\n    text-align: right;\n    font-size: 11px;\n    color: #666;\n    width: 35%;\n  }\n  .validity {\n    font-style: italic;\n    margin-top: 5px;\n  }\n</style>				10px	28px	left	left	180px	#007bff	#6c757d	Arial, sans-serif	1.6	10px	10px	10px	10px	#007bff	1px	#ffffff	t	2025-06-26 03:17:04.326	2025-06-27 15:41:04.49
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, email, password, role, is_active, created_at, updated_at, name) FROM stdin;
7	Kelvin	kelviincarlos@gmail.com	apoiotec1	admin	t	2025-06-24 12:45:13.206326	2025-06-24 12:45:13.206326	Kelvin
10	admin	apoiotec@apoiotec.com	apoiotec1	admin	t	2025-11-24 23:36:48.612666	2025-11-24 23:36:48.612666	admin
1	Marcelo	marcelo@live.no	$2b$10$vrDN98U3cM56FD0OWZUQq.Da528QkOsJMbtPI8mXcQEuznAaWcxoq	admin	t	2025-06-24 00:35:14.900976	2025-06-24 00:35:14.900976	Marcelo
9	Albano	albano@hotmail.dk	$2b$10$HbKzvBZIa7KuEdPIkUIrqeYbWxjhCyYp34TpM.rWkLCLu/0COcURq	admin	t	2025-11-22 21:19:20.9019	2025-11-22 21:19:20.9019	Albano
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: neondb_owner
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, false);


--
-- Name: backup_execution_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.backup_execution_logs_id_seq', 36, true);


--
-- Name: backup_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.backup_history_id_seq', 59, true);


--
-- Name: backup_schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.backup_schedules_id_seq', 4, true);


--
-- Name: calls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.calls_id_seq', 306, true);


--
-- Name: client_notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.client_notes_id_seq', 5, true);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.clients_id_seq', 182, true);


--
-- Name: digital_certificates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.digital_certificates_id_seq', 1, true);


--
-- Name: download_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.download_links_id_seq', 3, true);


--
-- Name: financial_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.financial_transactions_id_seq', 1277, true);


--
-- Name: history_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.history_events_id_seq', 1636, true);


--
-- Name: inventory_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.inventory_movements_id_seq', 31, true);


--
-- Name: inventory_products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.inventory_products_id_seq', 1, true);


--
-- Name: inventory_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.inventory_services_id_seq', 1, true);


--
-- Name: knowledge_base_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.knowledge_base_id_seq', 3, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.messages_id_seq', 2, true);


--
-- Name: notification_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.notification_preferences_id_seq', 98, true);


--
-- Name: preventive_maintenance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.preventive_maintenance_id_seq', 2, true);


--
-- Name: quotes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.quotes_id_seq', 100, false);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.services_id_seq', 588, true);


--
-- Name: signature_attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.signature_attempts_id_seq', 1, false);


--
-- Name: signature_audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.signature_audit_log_id_seq', 15, true);


--
-- Name: system_activation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.system_activation_id_seq', 6, true);


--
-- Name: system_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.system_settings_id_seq', 1, true);


--
-- Name: telegram_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.telegram_config_id_seq', 4, true);


--
-- Name: templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.templates_id_seq', 8, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 13, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: neondb_owner
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: backup_execution_logs backup_execution_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.backup_execution_logs
    ADD CONSTRAINT backup_execution_logs_pkey PRIMARY KEY (id);


--
-- Name: backup_history backup_history_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.backup_history
    ADD CONSTRAINT backup_history_pkey PRIMARY KEY (id);


--
-- Name: backup_schedules backup_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.backup_schedules
    ADD CONSTRAINT backup_schedules_pkey PRIMARY KEY (id);


--
-- Name: calls calls_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_pkey PRIMARY KEY (id);


--
-- Name: client_notes client_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.client_notes
    ADD CONSTRAINT client_notes_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: digital_certificates digital_certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.digital_certificates
    ADD CONSTRAINT digital_certificates_pkey PRIMARY KEY (id);


--
-- Name: download_links download_links_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.download_links
    ADD CONSTRAINT download_links_pkey PRIMARY KEY (id);


--
-- Name: financial_transactions financial_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_pkey PRIMARY KEY (id);


--
-- Name: history_events history_events_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.history_events
    ADD CONSTRAINT history_events_pkey PRIMARY KEY (id);


--
-- Name: inventory_movements inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (id);


--
-- Name: inventory_products inventory_products_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inventory_products
    ADD CONSTRAINT inventory_products_pkey PRIMARY KEY (id);


--
-- Name: inventory_services inventory_services_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inventory_services
    ADD CONSTRAINT inventory_services_pkey PRIMARY KEY (id);


--
-- Name: knowledge_base knowledge_base_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.knowledge_base
    ADD CONSTRAINT knowledge_base_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: preventive_maintenance preventive_maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.preventive_maintenance
    ADD CONSTRAINT preventive_maintenance_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: signature_attempts signature_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.signature_attempts
    ADD CONSTRAINT signature_attempts_pkey PRIMARY KEY (id);


--
-- Name: signature_audit_log signature_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.signature_audit_log
    ADD CONSTRAINT signature_audit_log_pkey PRIMARY KEY (id);


--
-- Name: system_activation system_activation_hardware_fingerprint_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_activation
    ADD CONSTRAINT system_activation_hardware_fingerprint_key UNIQUE (hardware_fingerprint);


--
-- Name: system_activation system_activation_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_activation
    ADD CONSTRAINT system_activation_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: telegram_config telegram_config_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.telegram_config
    ADD CONSTRAINT telegram_config_pkey PRIMARY KEY (id);


--
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict SAEymBaOaO7lb2QjmKYYVTjDhcHsY3f0H0L8SD5UlbdHCC2A82iWdgQVLX8mRwa

