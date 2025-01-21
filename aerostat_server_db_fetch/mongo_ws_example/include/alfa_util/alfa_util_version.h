#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1737481656
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Tue Jan 21 10:47:37 PM PST 2025"
#define CURRENT_BRANCH "websocket-setup"
#define COMMIT_HASH "fd1bc7de1b7e2d16fe3ae111623880485ddcbaa5"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
