<?php

namespace BLX\Cmi5\Domain\Model;

use TYPO3\CMS\Extbase\DomainObject\AbstractEntity;

/*
 * This file is part of the TYPO3 extension cmi5.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

class Config extends \T3SBS\T3sbootstrap\Domain\Model\Config
{
    /**
     * cmiSettings
     *
     * @var string
     */
    protected $cmiSettings = '';
    /**
     * cmiEnabled
     *
     * @var bool
     */
    protected $cmiEnabled = false;
    /**
     * cmiObjpropLang
     *
     * @var string
     */
    protected $cmiObjpropLang = '';
    /**
     * cmiDatamodelAuActtype
     *
     * @var string
     */
    protected $cmiDatamodelAuActtype = '';
    /**
     * cmiDatamodelAuId
     *
     * @var string
     */
    protected $cmiDatamodelAuId = '';
    /**
     * cmiDatamodelAuTitle
     *
     * @var string
     */
    protected $cmiDatamodelAuTitle = '';
    /**
     * cmiDatamodelAuDescr
     *
     * @var string
     */
    protected $cmiDatamodelAuDescr = '';
    /**
     * cmiDatamodelAuMoveon
     *
     * @var string
     */
    protected $cmiDatamodelAuMoveon = '';
    /**
     * cmiDatamodelAuLaunchmethod
     *
     * @var string
     */
    protected $cmiDatamodelAuLaunchmethod = '';
    /**
     * cmiDatamodelAuMasteryscore
     *
     * @var string
     */
    protected $cmiDatamodelAuMasteryscore = '';
    /**
     * cmiDatamodelAuLaunchparms
     *
     * @var string
     */
    protected $cmiDatamodelAuLaunchparms = '';
    /**
     * cmiDatamodelAuUrl
     *
     * @var string
     */
    protected $cmiDatamodelAuUrl = '';
    /**
     * cmiDatamodelAuEntitlementkey
     *
     * @var string
     */
    protected $cmiDatamodelAuEntitlementkey = '';
    /**
     * cmiDatamodelAuObjectives
     *
     * @var string
     */
    protected $cmiDatamodelAuObjectives = '';
    /**
     * cmiDatamodelCourseDescr
     *
     * @var string
     */
    protected $cmiDatamodelCourseDescr = '';
    /**
     * cmiDatamodelCourseTitle
     *
     * @var string
     */
    protected $cmiDatamodelCourseTitle = '';
    /**
     * cmiDatamodelCourseId
     *
     * @var string
     */
    protected $cmiDatamodelCourseId = '';

    public function getCmiSettings(): string
    {
        return $this->cmiSettings;
    }

    public function setCmiSettings(string $cmiSettings): void
    {
        $this->cmiSettings = $cmiSettings;
    }

    public function getCmiEnabled(): bool
    {
        return $this->cmiEnabled;
    }

    public function setCmiEnabled(bool $cmiEnabled): void
    {
        $this->cmiEnabled = $cmiEnabled;
    }

    public function getCmiObjpropLang(): string
    {
        return $this->cmiObjpropLang;
    }

    public function setCmiObjpropLang(string $cmiObjpropLang): void
    {
        $this->cmiObjpropLang = $cmiObjpropLang;
    }

    public function getCmiDatamodelAuActtype(): string
    {
        return $this->cmiDatamodelAuActtype;
    }

    public function setCmiDatamodelAuActtype(string $cmiDatamodelAuActtype): void
    {
        $this->cmiDatamodelAuActtype = $cmiDatamodelAuActtype;
    }

    public function getCmiDatamodelAuId(): string
    {
        return $this->cmiDatamodelAuId;
    }

    public function setCmiDatamodelAuId(string $cmiDatamodelAuId): void
    {
        $this->cmiDatamodelAuId = $cmiDatamodelAuId;
    }

    public function getCmiDatamodelAuTitle(): string
    {
        return $this->cmiDatamodelAuTitle;
    }

    public function setCmiDatamodelAuTitle(string $cmiDatamodelAuTitle): void
    {
        $this->cmiDatamodelAuTitle = $cmiDatamodelAuTitle;
    }

    public function getCmiDatamodelAuDescr(): string
    {
        return $this->cmiDatamodelAuDescr;
    }

    public function setCmiDatamodelAuDescr(string $cmiDatamodelAuDescr): void
    {
        $this->cmiDatamodelAuDescr = $cmiDatamodelAuDescr;
    }

    public function getCmiDatamodelAuMoveon(): string
    {
        return $this->cmiDatamodelAuMoveon;
    }

    public function setCmiDatamodelAuMoveon(string $cmiDatamodelAuMoveon): void
    {
        $this->cmiDatamodelAuMoveon = $cmiDatamodelAuMoveon;
    }

    public function getCmiDatamodelAuLaunchmethod(): string
    {
        return $this->cmiDatamodelAuLaunchmethod;
    }

    public function setCmiDatamodelAuLaunchmethod(string $cmiDatamodelAuLaunchmethod): void
    {
        $this->cmiDatamodelAuLaunchmethod = $cmiDatamodelAuLaunchmethod;
    }

    public function getCmiDatamodelAuMasteryscore(): string
    {
        return $this->cmiDatamodelAuMasteryscore;
    }

    public function setCmiDatamodelAuMasteryscore(string $cmiDatamodelAuMasteryscore): void
    {
        $this->cmiDatamodelAuMasteryscore = $cmiDatamodelAuMasteryscore;
    }

    public function getCmiDatamodelAuLaunchparms(): string
    {
        return $this->cmiDatamodelAuLaunchparms;
    }

    public function setCmiDatamodelAuLaunchparms(string $cmiDatamodelAuLaunchparms): void
    {
        $this->cmiDatamodelAuLaunchparms = $cmiDatamodelAuLaunchparms;
    }

    public function getCmiDatamodelAuUrl(): string
    {
        return $this->cmiDatamodelAuUrl;
    }

    public function setCmiDatamodelAuUrl(string $cmiDatamodelAuUrl): void
    {
        $this->cmiDatamodelAuUrl = $cmiDatamodelAuUrl;
    }

    public function getCmiDatamodelAuEntitlementkey(): string
    {
        return $this->cmiDatamodelAuEntitlementkey;
    }

    public function setCmiDatamodelAuEntitlementkey(string $cmiDatamodelAuEntitlementkey): void
    {
        $this->cmiDatamodelAuEntitlementkey = $cmiDatamodelAuEntitlementkey;
    }

    public function getCmiDatamodelAuObjectives(): string
    {
        return $this->cmiDatamodelAuObjectives;
    }

    public function setCmiDatamodelAuObjectives(string $cmiDatamodelAuObjectives): void
    {
        $this->cmiDatamodelAuObjectives = $cmiDatamodelAuObjectives;
    }

    public function getCmiDatamodelCourseDescr(): string
    {
        return $this->cmiDatamodelCourseDescr;
    }

    public function setCmiDatamodelCourseDescr(string $cmiDatamodelCourseDescr): void
    {
        $this->cmiDatamodelCourseDescr = $cmiDatamodelCourseDescr;
    }

    public function getCmiDatamodelCourseTitle(): string
    {
        return $this->cmiDatamodelCourseTitle;
    }

    public function setCmiDatamodelCourseTitle(string $cmiDatamodelCourseTitle): void
    {
        $this->cmiDatamodelCourseTitle = $cmiDatamodelCourseTitle;
    }

    public function getCmiDatamodelCourseId(): string
    {
        return $this->cmiDatamodelCourseId;
    }

    public function setCmiDatamodelCourseId(string $cmiDatamodelCourseId): void
    {
        $this->cmiDatamodelCourseId = $cmiDatamodelCourseId;
    }
}
