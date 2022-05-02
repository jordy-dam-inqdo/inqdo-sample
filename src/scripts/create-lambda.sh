#!/usr/bin/env bash​

GREEN=`tput setaf 2`
RED=`tput setaf 1`
YELLOW=`tput setaf 3`
CYAN=`tput setaf 6`
C=`tput sgr0`

logger_ok () {
    echo ""
    echo "${GREEN}#############################################${C}"
    echo $1
    echo "${GREEN}#############################################${C}"
    echo ""
}

logger_notok () {
    echo ""
    echo "${RED}#############################################${C}"
    echo $1
    echo "${RED}#############################################${C}"
    echo ""
}

if [[ $# -ge 1 ]]; then
    LAMBDA_NAME=$1


    SCRIPS_LOCATION=$(pwd)

    logger_ok "${CYAN}CREATING${C} - Lambda: ${YELLOW}${LAMBDA_NAME}${C}"

    cd ../cookiecutterlambda
    COOKIE_CUTTER_PWD=$PWD
    echo '{"lambda_name": "'$LAMBDA_NAME'"}' > cookiecutter.json

    cd ..
    cookiecutter $COOKIE_CUTTER_PWD

    cd ./$LAMBDA_NAME
    mv "Dockerfile-$LAMBDA_NAME-dev" ../_dockercompose

    logger_ok "${CYAN}SUCCESFULL CREATED${C} Lambda: ${YELLOW}${LAMBDA_NAME}${C} -  ${CYAN}HAPPY CODING${C} ${YELLOW}:)${C}"
    cd $SCRIPS_LOCATION

else
    logger_notok "Provide: ${YELLOW}lambda name${C} as args.${C}"
fi
