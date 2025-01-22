#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1737557875
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Wed Jan 22  7:57:55 PM PST 2025"
#define CURRENT_BRANCH "websocket-setup"
#define COMMIT_HASH "9d8c1ef7edc6de296ffc4423a3f5fe984d5e5a39"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
