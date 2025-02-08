#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1739010296
#define MAJOR 2
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Sat Feb 08  3:24:56 PM PST 2025"
#define CURRENT_BRANCH "fe-be-staging-v1.0.0"
#define COMMIT_HASH "028f94789ab5b85a9a9c31478758037f044c3d96"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
