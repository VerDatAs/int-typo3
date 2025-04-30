<?php

defined('TYPO3') || die();

# Extension configuration
$extconf = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\TYPO3\CMS\Core\Configuration\ExtensionConfiguration::class)->get('t3sbootstrap');

$tempPagesColumns = [
	'tx_t3sbootstrap_cmi_generatexml' => [
		'exclude' => 1,
		'label' => 'Generate cmi5.xml',
		'description' => 'Check to generate cmi5.xml',
		'config' => [
			'type' => 'check',
		],
	]
];

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTCAcolumns('pages', $tempPagesColumns);
unset($tempPagesColumns);
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addToAllTCAtypes(
	'pages',
	'--div--;cmi5,
		tx_t3sbootstrap_cmi_generatexml;',
	'',
	''
);
