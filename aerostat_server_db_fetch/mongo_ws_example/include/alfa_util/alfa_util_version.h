#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1737548088
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Wed Jan 22  5:14:48 PM PST 2025"
#define CURRENT_BRANCH "websocket-setup"
#define COMMIT_HASH "15f4a5eac5138d141efae554be8830c9b9ca03ea"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
