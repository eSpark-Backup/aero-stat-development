#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1737743538
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Fri Jan 24 11:32:18 PM PST 2025"
#define CURRENT_BRANCH "websocket-setup"
#define COMMIT_HASH "054ca3b0eb54f59499d6a8e6bcda7793809b5c0e"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
