#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1737564054
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Wed Jan 22  9:40:55 PM PST 2025"
#define CURRENT_BRANCH "websocket-setup"
#define COMMIT_HASH "2143c1e116f9f8a15bc04e09e953ce87df6d76aa"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
