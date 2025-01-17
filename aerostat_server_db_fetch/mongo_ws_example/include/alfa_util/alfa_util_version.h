#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1737123075
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Fri Jan 17  7:11:15 PM PST 2025"
#define CURRENT_BRANCH "websocket-setup"
#define COMMIT_HASH "f2d28f116bff02b91420d3af94b96cee839ba58a"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
