#
# Table structure for table 'tx_t3sbootstrap_domain_model_config'
#
CREATE TABLE tx_t3sbootstrap_domain_model_config (
	cmi_enabled tinyint(1) unsigned DEFAULT '0' NOT NULL,
	cmi_settings varchar(100) DEFAULT '' NOT NULL,
	cmi_objprop_lang varchar(15) DEFAULT '' NOT NULL,
	cmi_datamodel_course_id varchar(255) DEFAULT '' NOT NULL,
	cmi_datamodel_course_title varchar(100) DEFAULT '' NOT NULL,
	cmi_datamodel_course_descr varchar(255) DEFAULT '' NOT NULL,
	cmi_datamodel_au_id varchar(255) DEFAULT '' NOT NULL,
	cmi_datamodel_au_title varchar(100) DEFAULT '' NOT NULL,
	cmi_datamodel_au_descr varchar(255) DEFAULT '' NOT NULL,
	cmi_datamodel_au_objectives varchar(255) DEFAULT '' NOT NULL,
	cmi_datamodel_au_acttype varchar(100) DEFAULT '' NOT NULL,
	cmi_datamodel_au_launchmethod varchar(15) DEFAULT '' NOT NULL,
	cmi_datamodel_au_moveon varchar(15) DEFAULT '' NOT NULL,
	cmi_datamodel_au_masteryscore varchar(4) DEFAULT '' NOT NULL,
	cmi_datamodel_au_url varchar(100) DEFAULT '' NOT NULL,
	cmi_datamodel_au_launchparms varchar(100) DEFAULT '' NOT NULL,
	cmi_datamodel_au_entitlementkey varchar(100) DEFAULT '' NOT NULL
);

#
# Table structure for table 'tt_content'
#
CREATE TABLE tt_content (
    tx_t3sbootstrap_bgopacity varchar(9) DEFAULT '' NOT NULL,
	tx_t3sbootstrap_cmi5_select_statement varchar(100) DEFAULT '' NOT NULL,
	tx_t3sbootstrap_cmi5_send_statement tinyint(1) unsigned DEFAULT '0' NOT NULL
);

#
# Table structure for table 'pages'
#
CREATE TABLE pages (
	tx_t3sbootstrap_cmi_generatexml tinyint(1) unsigned DEFAULT '0' NOT NULL
);
