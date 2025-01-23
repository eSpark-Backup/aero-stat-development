#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1737651393
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Thu Jan 23  9:56:33 PM PST 2025"
#define CURRENT_BRANCH "websocket-setup"
#define COMMIT_HASH "12a065ee0a8b2d13cf7b0158eee843672fa88988"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
