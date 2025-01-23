#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1737647830
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Thu Jan 23  8:57:10 PM PST 2025"
#define CURRENT_BRANCH "websocket-setup"
#define COMMIT_HASH "2e9c45f2868fa1dd9eae11dd84b620ccc4c1b68f"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
