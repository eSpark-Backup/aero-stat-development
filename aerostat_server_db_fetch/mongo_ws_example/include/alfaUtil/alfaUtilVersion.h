#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1738021636
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Tue Jan 28  4:47:16 AM PST 2025"
#define CURRENT_BRANCH "websocket-setup"
#define COMMIT_HASH "f331d86b9c4dd86aa1865ba920dd449aa19f4a45"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
