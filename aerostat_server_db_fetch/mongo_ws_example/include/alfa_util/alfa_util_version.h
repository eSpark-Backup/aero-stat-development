#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1737115715
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Fri Jan 17  5:08:35 PM PST 2025"
#define CURRENT_BRANCH "websocket-setup"
#define COMMIT_HASH "df186ee30ba63132bb2e530c120c838711156317"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
