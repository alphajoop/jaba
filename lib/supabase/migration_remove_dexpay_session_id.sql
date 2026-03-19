-- Supprimer la colonne dexpay_session_id (redondante avec reference)
alter table orders drop column if exists dexpay_session_id;
