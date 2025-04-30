<?php

$tempColumns = [
    'cmi_enabled' => [
        'exclude' => false,
        'label' => 'Enable cmi5',
        'accordion_id' => 11,
        'accordion_sub' => '11-1',
        'info' => 'Check to enable cmi5',
        'config' => [
            'type' => 'check',
            'items' => [
                '1' => [
                    '0' => ''
                ]
            ]
        ]
    ],
    'cmi_objprop_lang' => [
        'exclude' => false,
        'label' => 'Language',
        'accordion_id' => 11,
        'accordion_sub' => '11-1',
        'info' => 'Select Language of AU',
        'config' => [
            'type' => 'select',
            'renderType' => 'selectSingle',
            'items' => [
                ['none', ''],
                ['de-DE', 'de-DE'],
                ['en-EN', 'en-EN'],
                ['fr-FR', 'fr-FR'],
                ['es-ES', 'es-Es']
            ]
        ]
    ],
    'cmi_datamodel_au_id' => [
        'exclude' => false,
        'label' => 'ID',
        'accordion_id' => 11,
        'accordion_sub' => '11-1',
        'info' => 'Edit AU ID (IRI Format)',
        'config' => [
            'type' => 'input'
        ]
    ],
    'cmi_datamodel_au_acttype' => [
        'exclude' => false,
        'label' => 'Activity Type',
        'accordion_id' => 11,
        'accordion_sub' => '11-1',
        'info' => 'Select Activity Type of AU',
        'config' => [
            'type' => 'select',
            'renderType' => 'selectSingle',
            'items' => [
                ['none', ''],
                ['http://adlnet.gov/expapi/activities/course', 'http://adlnet.gov/expapi/activities/course'],
                ['http://adlnet.gov/expapi/activities/assessment', 'http://adlnet.gov/expapi/activities/assessment'],
                ['http://adlnet.gov/expapi/activities/module', 'http://adlnet.gov/expapi/activities/module'],
                ['http://activitystrea.ms/schema/1.0/task', 'http://activitystrea.ms/schema/1.0/task']
            ]
        ]
    ],
    'cmi_datamodel_au_title' => [
        'exclude' => false,
        'label' => 'Title',
        'accordion_id' => 11,
        'accordion_sub' => '11-1',
        'info' => 'Edit Title of AU',
        'config' => [
            'type' => 'input'
        ]
    ],
    'cmi_datamodel_au_descr' => [
        'exclude' => false,
        'label' => 'Description',
        'accordion_id' => 11,
        'accordion_sub' => '11-1',
        'info' => 'Edit Description of AU (optional)',
        'config' => [
            'type' => 'input'
        ]
    ],
    'cmi_datamodel_au_objectives' => [
        'exclude' => false,
        'label' => 'Objectives',
        'accordion_id' => 11,
        'accordion_sub' => '11-1',
        'info' => 'Edit Objectives of AU (optional)',
        'config' => [
            'type' => 'input'
        ]
    ],
    'cmi_datamodel_au_launchmethod' => [
        'exclude' => false,
        'label' => 'Launch Method',
        'accordion_id' => 11,
        'accordion_sub' => '11-1',
        'info' => 'Select Launch Method of AU',
        'config' => [
            'type' => 'select',
            'renderType' => 'selectSingle',
            'items' => [
                ['none', ''],
                ['Own Window', 'OwnWindow'],
                ['Any Window', 'AnyWindow']
            ]
        ]
    ],
    'cmi_datamodel_au_moveon' => [
        'exclude' => false,
        'label' => 'MoveOn Criteria',
        'accordion_id' => 11,
        'accordion_sub' => '11-1',
        'info' => 'Select moveOn Criteria of AU',
        'config' => [
            'type' => 'select',
            'renderType' => 'selectSingle',
            'items' => [
                ['none', ''],
                ['Passed', 'Passed'],
                ['Completed', 'Completed'],
                ['Completed and Passed', 'CompletedAndPassed'],
                ['Completed or Passed', 'CompletedOrPassed'],
                ['Not applicable', 'NotApplicable']
            ]
        ]
    ],
    'cmi_datamodel_au_masteryscore' => [
        'exclude' => false,
        'label' => 'Mastery Score',
        'accordion_id' => 11,
        'accordion_sub' => '11-1',
        'info' => 'Edit Mastery Score, for example 0.75 (75%)',
        'config' => [
            'type' => 'input'
        ]
    ],
    'cmi_datamodel_au_url' => [
        'exclude' => false,
        'label' => 'Link (URL)',
        'accordion_id' => 11,
        'accordion_sub' => '11-1',
        'info' => 'Edit Link to AU as URL',
        'config' => [
            'type' => 'input'
        ]
    ],
    'cmi_datamodel_au_launchparms' => [
        'exclude' => false,
        'label' => 'Launch Parameters',
        'accordion_id' => 11,
        'accordion_sub' => '11-1',
        'info' => 'Edit Launch Parameters of AU (optional)',
        'config' => [
            'type' => 'input'
        ]
    ],
    'cmi_datamodel_au_entitlementkey' => [
        'exclude' => false,
        'label' => 'Entitlement Key',
        'accordion_id' => 11,
        'accordion_sub' => '11-1',
        'info' => 'Edit Entitlement Key of AU (optional)',
        'config' => [
            'type' => 'input'
        ]
    ],
    'cmi_datamodel_course_id' => [
        'exclude' => false,
        'label' => 'Course ID',
        'accordion_id' => 11,
        'accordion_sub' => '11-2',
        'info' => 'Edit Course ID (IRI Format)',
        'config' => [
            'type' => 'input'
        ]
    ],
    'cmi_datamodel_course_title' => [
        'exclude' => false,
        'label' => 'Course Title',
        'accordion_id' => 11,
        'accordion_sub' => '11-2',
        'info' => 'Edit Title of Course',
        'config' => [
            'type' => 'input'
        ]
    ],
    'cmi_datamodel_course_descr' => [
        'exclude' => false,
        'label' => 'Course Description',
        'accordion_id' => 11,
        'accordion_sub' => '11-2',
        'info' => 'Edit Description of Course (optional)',
        'config' => [
            'type' => 'input'
        ]
    ]
];

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTCAcolumns('tx_t3sbootstrap_domain_model_config', $tempColumns);
unset($tempColumns);