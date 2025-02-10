#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1739211598
#define MAJOR 2
#define MINOR 0
#define BATCH 1

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Mon Feb 10 11:19:58 PM PST 2025"
#define CURRENT_BRANCH "fe-be-staging-v1.0.0"
#define COMMIT_HASH "3b3bc254a0c9f25e13719944c34230a01896cbfc"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
