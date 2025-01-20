#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1737143596
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Sat Jan 18 12:53:16 AM PST 2025"
#define CURRENT_BRANCH "websocket-setup"
#define COMMIT_HASH "637b0fc2fdb394ae6cb8ece26ba796f540e85f51"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
