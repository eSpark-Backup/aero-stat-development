#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1737626453
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Thu Jan 23  3:00:53 PM PST 2025"
#define CURRENT_BRANCH "websocket-setup"
#define COMMIT_HASH "80cf91896389b78a5ea0334c62828aa4c9c2c3a2"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
