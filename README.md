# TYPO3 LCMS

## **About**

The TYPO3 LCMS is a customer centric and future-proof Learning Content Management System to create, curate, manage and deploy digital learning content using xAPI/cmi5. It is build on top of TYPO3 and a collection of TYPO3 extensions to enable the seamless integration of the H5P ecosystem and the xAPI/cmi5 features.

## Installation

The best way to get started with the LCMS is to install TYPO3 using DDEV, Docker and Composer on your local machine (also refer to [
TYPO3 - Getting Started Tutorial](https://docs.typo3.org/m/typo3/tutorial-getting-started/12.4/en-us/Index.html#)).

### Pre-Installation Checklist

1. **Install Docker** - Visit [docker.com](https://www.docker.com/) to download and install the recommended version of Docker for your operating system.
2. **Install DDEV** - Follow the [DDEV installation guide](https://ddev.readthedocs.io/en/stable/) to install DDEV.

DDEV and Docker need to be installed on your local machine before TYPO3 can be installed. If you need help installing DDEV, support can be found on the [DDEV Discord server](https://discord.gg/kDvSFBSZfs).

### Create the Installation Directory

Create an empty directory to install TYPO3 in and then change into that directory:

```plain
mkdir t3lcms
cd t3lcms
```

### Create a new DDEV Project

The `ddev config` command will prompt for information about your project. TYPO3 is in the list of preconfigured projects.

```plain
ddev config --php-version 8.1 --docroot public --project-type typo3
```

#### Docroot Location

Is the folder containing files that have to be reached by the webserver. It contains the vital entry point `index.php`. The folder is commonly called `public`.

#### Project Type

Should always be "typo3"

### Start the project

```sql
ddev start
```

  

The webserver is now running but TYPO3 is not yet installed.

### Install TYPO3

```sql
ddev composer create "typo3/cms-base-distribution:^12"
```

### Run the Installation Setup Tool

Interactive / guided setup (questions/answers):

```plain
ddev typo3 setup
```

  

When prompted give the following answers to work with the default DDEV configuration:

```plain
Which web server is used?
> other Database driver?
> mysqli Enter the database "username" [default: db] ? db Enter the database "password" ? db Enter the database "port" [default: 3306] ? 3306 Enter the database "host" [default: db] ? db Select which database to use:
> db
```

  

### Install the required Extensions for the LCMS

```plain
git clone https://github.com/VerDatAs/int-typo3.git packages/cmi5
```

  

```plain
ddev composer require typo3/cms-scheduler t3sbs/t3sbootstrap oktopuce/site-generator michielroos/h5p:@dev blx/cmi5:@dev

ddev composer config scripts.post-update-cmd 'php packages/blx-cmi5/Resources/Public/InitialSetup/postupdate.php' 

ddev import-db --src=packages/blx-cmi5/Resources/Public/InitialSetup/project-template.sql.gz

zcat packages/blx-cmi5/Resources/Public/InitialSetup/project-template.sql.gz | mysql -u root -p typo3
```
