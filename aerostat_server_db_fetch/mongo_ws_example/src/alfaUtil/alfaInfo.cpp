#include <stdio.h>
#include "alfaUtil/alfaInfo.h"
#include "alfaUtil/alfaUtilVersion.h"
#include "logger/logger.h"

void printBuildInfo(void) {
    LOG_WARNING("=======================================================");
    LOG_WARNING("                    Build Information                  ");
    LOG_WARNING("=======================================================");
    LOG_WARNING("Version       : %s", VERSION_STR);
    LOG_WARNING("Build Date    : %s", COMPILE_TIME);
    LOG_WARNING("Developer     : %s", DEVELOPER);
    LOG_WARNING("Branch        : %s", CURRENT_BRANCH);
    LOG_WARNING("Commit Hash   : %s", COMMIT_HASH);
    LOG_WARNING("=======================================================");
}
