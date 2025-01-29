#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1738161997
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Wed Jan 29  7:46:37 PM PST 2025"
#define CURRENT_BRANCH "fe-be-staging-v1.0.0"
#define COMMIT_HASH "bbf40a42c72bbfc6b0e1bc9aa1075eeae9e3ad99"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
