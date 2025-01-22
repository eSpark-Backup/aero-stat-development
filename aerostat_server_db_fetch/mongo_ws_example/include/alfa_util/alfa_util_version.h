#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1737556768
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Wed Jan 22  7:39:28 PM PST 2025"
#define CURRENT_BRANCH "websocket-setup"
#define COMMIT_HASH "10520c3633ecb9184ad5df3ebe11d5dba159e086"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
